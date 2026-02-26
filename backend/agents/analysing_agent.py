import os
import sys
import json

# Ensure the project root is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from langchain_groq import ChatGroq
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.tools import tool
from dotenv import load_dotenv

from services.analytics import AnalyticsService
from tools.fuliza_usage_tool import get_fuliza_usage
from tools.spending_by_category_tool import get_spending_by_category
from tools.spending_tool import get_spending_summary
from tools.top_transactions_tool import get_top_transactions

load_dotenv()

# ── Create a shared analytics instance ───────────────────────────────────────
analytics = AnalyticsService()

# ── BUILD THE AGENT ──────────────────────────────────────────────────────────

def build_finance_agent():
    """
    Build the agentic financial advisor.

    Agent architecture:
    - BRAIN  : Groq LLaMA 3.3 70B
    - MEMORY : ConversationBufferMemory (tracks full session)
    - TOOLS  : get_spending_summary, get_spending_by_category,
               get_top_transactions, get_fuliza_usage
    """

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=4000,
        api_key=os.getenv("GROQ_API_KEY")
    )

    tools = [get_spending_summary, get_spending_by_category,
             get_top_transactions, get_fuliza_usage]

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )

    system_message = """You are an intelligent M-PESA Financial Advisor Agent.
                        You help users understand their spending habits based on their M-PESA transaction history
                        stored in a database.

                        Your available tools:
                        - get_spending_summary     → Total spent vs total received
                        - get_spending_by_category → Spending broken down by type (Merchant, Transfers, Airtime, etc.)
                        - get_top_transactions     → The 10 largest single expenditures
                        - get_fuliza_usage         → How much Fuliza (overdraft) was used

                        CRITICAL RULES:
                        1. Do NOT re-call tools if the data is already in the conversation history.
                        If the user asks a follow-up question, answer from what you already know.
                        2. Only call a tool if the user asks about something you have NOT retrieved yet.
                        3. Use KES for all currency values.
                        4. Be encouraging but honest about bad spending habits.
                        5. Keep follow-up answers concise and specific to what the user asked.
                        6. Format your responses clearly with sections and bullet points.
                    """

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        return_intermediate_steps=False,
        handle_parsing_errors=True,
        max_iterations=5,
        agent_kwargs={
            "prefix": system_message
        }
    )

    return agent
