from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class BaseRule(ABC):
    """
    Abstract base class for deterministic business validation rules.
    Allows easy addition of new rules without altering the main pipeline logic.
    """
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier/name of the rule."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Brief user-facing description of what is checked."""
        pass

    @abstractmethod
    def evaluate(self, invoice_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Evaluates the rule against raw invoice data.
        Returns:
            passed (bool): True if rule criteria met
            message (str): Underwriting detail or validation failure reason
        """
        pass
