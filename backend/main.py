from helpers.file_loader import load_statements, clean_mpesa_text, consolidate_fuliza
from database.session import engine
from database.models import Base
from database.repository import TransactionRepository
from agents.analysing_agent import build_finance_agent
import sys
import os
from colorama import Fore, Style, init

init(autoreset=True)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def main():
    print(f"""
{Fore.CYAN}
╔═══════════════════════════════════════════════════════╗
║        💸 MPESA FINANCE TRACKER AI                    ║
║                                                       ║
║  Powered by: LangChain + Groq (LLaMA 3.3 70B)         ║
╚═══════════════════════════════════════════════════════╝
{Style.RESET_ALL}""")

    # ── Step 1: Load data into DB ────────────────────────────────────────────
    Base.metadata.create_all(engine)

    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = input(f"{Fore.YELLOW}📂 Enter path to your M-PESA statement (.pdf or .csv): {Style.RESET_ALL}").strip()

    if not file_path or not os.path.exists(file_path):
        print(f"{Fore.RED}❌ File not found: {file_path}{Style.RESET_ALL}")
        sys.exit(1)

    print(f"{Fore.YELLOW}ℹ️  Loading M-PESA statement from {file_path}...{Style.RESET_ALL}")
    raw = load_statements(file_path)
    df = clean_mpesa_text(raw)
    df = consolidate_fuliza(df)

    repo = TransactionRepository()
    repo.add_bulk(df)
    repo.close()
    print(f"{Fore.GREEN}✅ {len(df)} transactions loaded into database.{Style.RESET_ALL}")

    # ── Step 2: Build the AI Agent ───────────────────────────────────────────
    print(f"{Fore.YELLOW}ℹ️  Building Finance Agent...{Style.RESET_ALL}")
    agent = build_finance_agent()
    print(f"{Fore.GREEN}✅ Agent ready!{Style.RESET_ALL}\n")

    # ── Step 3: Auto-run initial analysis ────────────────────────────────────
    print(f"{Fore.MAGENTA}🤖 Agent: Let me analyze your spending...{Style.RESET_ALL}\n")
    response = agent.invoke({
        "input": "Give me a full overview of my spending. Show total spent vs received, "
                 "breakdown by category, my top 5 biggest expenses, and my Fuliza usage. "
                 "Then give me suggestions on how to save money."
    })
    print(f"\n{Fore.WHITE}{response['output']}{Style.RESET_ALL}")

    # ── Step 4: Free chat ────────────────────────────────────────────────────
    print(f"\n{Fore.CYAN}{'─' * 60}{Style.RESET_ALL}")
    print(f"{Fore.MAGENTA}🤖 Agent: You can now ask me anything about your finances!{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}ℹ️  Type 'exit' to quit.{Style.RESET_ALL}\n")

    while True:
        user_input = input(f"{Fore.WHITE}You: {Style.RESET_ALL}").strip()
        if user_input.lower() in ["exit", "quit", "bye"]:
            print(f"{Fore.MAGENTA}🤖 Agent: Happy saving! 💰{Style.RESET_ALL}")
            break
        if not user_input:
            continue
        response = agent.invoke({"input": user_input})
        print(f"\n{Fore.WHITE}{response['output']}{Style.RESET_ALL}\n")


if __name__ == "__main__":
    main()
