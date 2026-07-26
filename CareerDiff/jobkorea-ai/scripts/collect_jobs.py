import asyncio

from app.core.database import SessionFactory, initialize_database
from app.services.collector import CollectionService


async def main() -> None:
    await initialize_database()
    async with SessionFactory() as session:
        result = await CollectionService(session).collect()
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
