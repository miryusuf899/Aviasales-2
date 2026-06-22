from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


UserRole = Literal["passenger", "admin"]


class UserBase(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    role: UserRole = "passenger"


class UserCreate(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
