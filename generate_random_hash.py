import secrets

try:
    length = int(input("Enter The Length Of Hash: "))
    print(f"Hash: {secrets.token_hex(nbytes=length)}")
except Exception as error:
    print(error)
