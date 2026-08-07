import hashlib
import random

def generate_mock_irn():
    """Generates a valid-looking 64-character hex string (IRN)."""
    random_string = str(random.getrandbits(256)).encode('utf-8')
    return hashlib.sha256(random_string).hexdigest()

def generate_mock_gstin(state_code="29", entity_type="C"):
    """Generates a valid-looking GSTIN format."""
    # Format: 2 digits state, 5 chars, 4 digits, 1 char, 1 digit/char, Z, 1 digit/char
    # e.g., 29ABCDE1234F1Z5
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    digits = "0123456789"
    
    pan_chars = "".join(random.choices(chars, k=5))
    pan_nums = "".join(random.choices(digits, k=4))
    pan_last = random.choice(chars)
    
    pan = pan_chars + pan_nums + pan_last
    
    entity_code = random.choice(digits + chars)
    checksum = random.choice(digits + chars)
    
    gstin = f"{state_code}{pan}{entity_code}Z{checksum}"
    return gstin

if __name__ == "__main__":
    print("========================================")
    print("MOCK GST / IRN GENERATOR (FOR DEMO PURPOSES)")
    print("========================================\n")
    
    for i in range(3):
        print(f"--- Example {i+1} ---")
        print(f"IRN:          {generate_mock_irn()}")
        print(f"Seller GSTIN: {generate_mock_gstin()}")
        print(f"Buyer GSTIN:  {generate_mock_gstin('27')}")
        print()
