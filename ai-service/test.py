import asyncio
from app.api.chat import send_chat_message, ChatMessageRequest

async def main():
    try:
        from app.core.db import connect_to_mongo
        await connect_to_mongo()
        
        req = ChatMessageRequest(
            session_id="test-manual-123",
            message="Show platform usage analytics",
            user_id="test-user",
            user_role="SUPER_ADMIN",
            user_name="User",
            context="None"
        )
        res = await send_chat_message(req)
        print("Response:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
