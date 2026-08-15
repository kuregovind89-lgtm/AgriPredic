import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#load_dotenv()

# Read database URL from .env
DB_URL = os.getenv("DB_URL")

# Default connection for XAMPP MySQL
if not DB_URL:
    DB_URL = "mysql+pymysql://root:@localhost:3307/agripredic"

# Create SQLAlchemy engine
engine = create_engine(DB_URL)

# Session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()