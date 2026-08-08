import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, firestore
from uuid import uuid4

logger = logging.getLogger("Invoice2Credit-Firebase")

# ─── Mock Firestore Emulator Fallback ────────────────────────────────────────

class MockDocumentReference:
    def __init__(self, collection_name, doc_id, db_instance):
        self.collection_name = collection_name
        self.id = doc_id
        self.db = db_instance
        # Required for batch updates
        class MockRef:
            def __init__(self, doc_ref):
                self.doc_ref = doc_ref
        self.reference = MockRef(self)

    def get(self):
        doc = self.db.data.setdefault(self.collection_name, {}).get(self.id)
        class MockSnap:
            exists = doc is not None
            id = self.id
            def to_dict(self):
                return doc
        return MockSnap()

    def set(self, data):
        self.db.data.setdefault(self.collection_name, {})[self.id] = data
        self.db.save()

    def update(self, data):
        doc = self.db.data.setdefault(self.collection_name, {}).get(self.id, {})
        doc.update(data)
        self.db.data[self.collection_name][self.id] = doc
        self.db.save()

    def delete(self):
        if self.id in self.db.data.setdefault(self.collection_name, {}):
            del self.db.data[self.collection_name][self.id]
            self.db.save()

class MockCollectionReference:
    def __init__(self, collection_name, db_instance):
        self.name = collection_name
        self.db = db_instance
        self.filters = []
        self._limit = None

    def document(self, doc_id):
        return MockDocumentReference(self.name, doc_id, self.db)

    def add(self, data):
        doc_id = str(uuid4())
        self.document(doc_id).set(data)
        class MockRef:
            id = doc_id
        return None, MockRef()

    def where(self, field, op, val):
        def match(doc):
            if op == "==":
                return doc.get(field) == val
            return True
        self.filters.append(match)
        return self

    def order_by(self, field, direction="ASCENDING"):
        # Enforce order_by chainability
        return self

    def limit(self, n):
        self._limit = n
        return self

    def stream(self):
        docs = self.db.data.setdefault(self.name, {})
        results = []
        for doc_id, data in docs.items():
            if all(f(data) for f in self.filters):
                class MockDoc:
                    id = doc_id
                    reference = MockDocumentReference(self.name, doc_id, self.db)
                    def to_dict(self):
                        return data
                results.append(MockDoc())
        # Sort desc by default if there's createdAt
        try:
            results.sort(key=lambda d: d.to_dict().get("createdAt", ""), reverse=True)
        except Exception:
            pass
        if self._limit:
            results = results[:self._limit]
        return results

class MockFirestore:
    def __init__(self, file_path="mock_db.json"):
        self.file_path = file_path
        self.data = {}
        self.load()

    def load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception:
                self.data = {}

    def save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    def collection(self, name):
        return MockCollectionReference(name, self)

    def batch(self):
        class MockBatch:
            def __init__(self, db):
                self.db = db
                self.ops = []
            def update(self, ref_wrapper, data):
                # ref_wrapper can be a document reference or wrapper with ref
                doc_ref = getattr(ref_wrapper, "doc_ref", ref_wrapper)
                self.ops.append((doc_ref, data))
            def commit(self):
                for ref, data in self.ops:
                    ref.update(data)
        return MockBatch(self)


# ─── FirebaseService ─────────────────────────────────────────────────────────

from dotenv import load_dotenv
load_dotenv()

class FirebaseService:
    def __init__(self):
        self.db = None
        self.app = None
        
    def initialize(self):
        # 1. Check for raw JSON string in environment variables
        json_env = os.getenv("FIREBASE_CREDENTIALS_JSON") or os.getenv("FIREBASE_SERVICE_ACCOUNT")
        if json_env:
            try:
                cred_dict = json.loads(json_env)
                if not firebase_admin._apps:
                    cred = credentials.Certificate(cred_dict)
                    self.app = firebase_admin.initialize_app(cred)
                else:
                    self.app = firebase_admin.get_app()
                self.db = firestore.client()
                logger.info("Firebase Admin SDK initialized successfully from environment JSON.")
                return
            except Exception as e:
                logger.warning(f"Could not initialize Firebase from JSON string: {e}")

        # 2. Check candidate file paths
        candidate_paths = [
            os.getenv("FIREBASE_CREDENTIALS_PATH"),
            "/etc/secrets/firebase-service-account.json",
            "app/config/firebase-service-account.json",
            os.path.join(os.path.dirname(__file__), "../../../app/config/firebase-service-account.json"),
            os.path.join(os.path.dirname(__file__), "../../config/firebase-service-account.json"),
        ]
        
        valid_path = None
        for p in candidate_paths:
            if p and os.path.exists(p):
                valid_path = p
                break
        
        if not valid_path:
            logger.warning("Firebase credentials not found. Launching in local-file Mock Mode (mock_db.json).")
            self.db = MockFirestore()
            return
            
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(valid_path)
                self.app = firebase_admin.initialize_app(cred)
            else:
                self.app = firebase_admin.get_app()
            self.db = firestore.client()
            logger.info(f"Firebase Admin SDK initialized successfully from {valid_path}.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}. Falling back to Mock mode.")
            self.db = MockFirestore()

# Central Instance
firebase_service = FirebaseService()
