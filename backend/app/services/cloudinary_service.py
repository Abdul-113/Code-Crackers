import cloudinary
import cloudinary.uploader
import os

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET
    )

class CloudinaryService:
    @staticmethod
    def upload_file(file_bytes: bytes, filename: str) -> str:
        """
        Uploads file bytes directly to Cloudinary and returns the secure URL.
        """
        if not CLOUDINARY_CLOUD_NAME:
            print("Warning: Cloudinary is not configured. Skipping upload.", flush=True)
            return ""

        try:
            ext = filename.lower().split(".")[-1]
            if ext in ["pdf", "docx", "doc", "txt"]:
                res_type = "raw"
            elif ext in ["png", "jpg", "jpeg", "webp", "gif"]:
                res_type = "image"
            else:
                res_type = "auto"

            safe_filename = "".join([c if c.isalnum() else "_" for c in filename.split(".")[0]])
            from datetime import datetime
            timestamp = int(datetime.utcnow().timestamp())
            
            if res_type == "raw":
                final_public_id = f"{safe_filename}_{timestamp}.{ext}"
            else:
                final_public_id = f"{safe_filename}_{timestamp}"

            print(f"[CLOUDINARY] Uploading {filename} to Cloudinary as {res_type}...", flush=True)

            response = cloudinary.uploader.upload(
                file_bytes,
                folder="invoice2credit/invoices",
                public_id=final_public_id,
                resource_type=res_type,
                access_mode="public",
                type="upload",
                overwrite=True,
                invalidate=True
            )

            print(f"[CLOUDINARY] Upload response: {response}", flush=True)
            return response.get("secure_url", "")
        except Exception as e:
            print(f"Error uploading to Cloudinary: {e}", flush=True)
            return ""

    @staticmethod
    def delete_file(cloudinary_url: str) -> bool:
        """
        Removes a file from Cloudinary based on its secure URL.
        """
        if not CLOUDINARY_CLOUD_NAME or not cloudinary_url or "cloudinary.com" not in cloudinary_url:
            return False

        try:
            url_parts = cloudinary_url.split("/upload/")
            if len(url_parts) < 2:
                return False
            
            path_parts = url_parts[1].split("/")
            if len(path_parts) < 2:
                return False
            
            if path_parts[0].startswith("v"):
                path_parts = path_parts[1:]
                
            public_path = "/".join(path_parts)
            public_id = public_path.rsplit(".", 1)[0]
            
            print(f"[CLOUDINARY] Deleting resource {public_id} from Cloudinary...", flush=True)
            
            for res_type in ["image", "raw", "video"]:
                result = cloudinary.uploader.destroy(public_id, resource_type=res_type)
                if result.get("result") == "ok":
                    print(f"[CLOUDINARY] Successfully deleted {public_id} as {res_type}", flush=True)
                    return True
            return False
        except Exception as e:
            print(f"Error deleting from Cloudinary: {e}", flush=True)
            return False
