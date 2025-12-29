from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    def __str__(self):
        return f"{self.email} - {self.password}"

class UserRead(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenSchema(BaseModel):
    refresh_token: str

class TokenSchema(BaseModel):
    token: str