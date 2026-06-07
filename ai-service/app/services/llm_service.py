import logging
import requests
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, SystemMessage

# Import our custom HR tools
from .tools.ats_tools import get_open_jobs, get_top_candidates, create_job_posting
from .tools.hr_tools import get_low_attendance, get_payroll_summary, get_pending_leaves

logger = logging.getLogger(__name__)

# Base System Prompt
SYSTEM_PROMPT = """You are HRGPT Assistant, an AI Copilot for HR operations.
You are assisting a user with role: {role}.

You have access to several tools. If the user asks for data or wants to perform an action (like viewing candidates, creating a job, or checking payroll), YOU MUST USE THE TOOLS.
Do NOT make up data. If you use a tool, wait for its response and present the data clearly using Markdown formatting.

You can include actionable UI suggestions using JSON blocks like `[ACTION: CREATE_JOB]`.

Context from current page:
{context}
"""

class LLMService:
    def __init__(self, provider: str = "ollama", model: str = "llama3"):
        self.provider = provider
        self.model = model
        self.base_url = "http://localhost:11434"
        
        # Initialize LangChain LLM
        self.llm = ChatOllama(model=self.model, base_url=self.base_url, temperature=0.7)
        
        # Register available tools
        self.tools = [
            get_open_jobs,
            get_top_candidates,
            create_job_posting,
            get_low_attendance,
            get_payroll_summary,
            get_pending_leaves
        ]

    async def generate_response(
        self,
        message: str,
        user_id: str = "system",
        role: str = "EMPLOYEE",
        history: list = None,
        context: str = None
    ) -> str:
        """Generate response via LangGraph React Agent."""
        if not self.is_available():
            return "Ollama is currently offline. Please ensure the local AI engine is running."

        # Format system prompt
        formatted_system = SYSTEM_PROMPT.format(
            role=role, 
            context=context or "No page context provided."
        )

        # Build message history for the agent state
        messages = [SystemMessage(content=formatted_system)]
        
        if history:
            for msg in history[-5:]:
                if msg.get("role") == "user":
                    messages.append(HumanMessage(content=msg.get("content", "")))
                else:
                    # In langgraph, AI messages need to be AIMessage, but for simplicity we just format
                    # them as system/human to avoid strict tool call validation errors if the history was truncated
                    pass

        # We append the current user message, injecting the required tool kwargs so the LLM has them
        # (Alternatively, we could use langchain's injected tool dependencies, but for local models this is safer)
        modified_input = f"{message}\n\n(SYSTEM NOTE: If you use a tool, you MUST pass user_id='{user_id}' and role='{role}' as arguments.)"
        messages.append(HumanMessage(content=modified_input))

        try:
            # Create the agent dynamically so it has the current state modifier if needed,
            # or just use the messages array which already contains the SystemMessage
            agent_executor = create_react_agent(self.llm, tools=self.tools)
            
            response = agent_executor.invoke({"messages": messages})
            
            # The final response is the last message in the state
            final_message = response["messages"][-1].content
            return final_message
        except Exception as e:
            logger.error(f"Agent execution error: {str(e)}")
            return "I encountered an error while trying to process your request. Please try rephrasing it."

    def is_available(self) -> bool:
        """Check if Ollama is reachable."""
        try:
            r = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return r.status_code == 200
        except Exception:
            return False

# Singleton instance
llm_service = LLMService()
