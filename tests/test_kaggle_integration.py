"""Tests for Kaggle integration."""

import pytest

from signaction.kaggle_helper import KaggleHelper


class TestKaggleHelper:
    """Test Kaggle helper functionality."""

    def test_datasets_available(self):
        """Test that datasets are available."""
        datasets = KaggleHelper.list_datasets()
        assert datasets is not None
        assert len(datasets) > 0
        assert "wlasl" in datasets

    def test_dataset_structure(self):
        """Test that datasets have required fields."""
        datasets = KaggleHelper.list_datasets()
        for key, info in datasets.items():
            assert "id" in info
            assert "description" in info
            assert "type" in info

    def test_get_assets_dir(self):
        """Test assets directory detection."""
        assets_dir = KaggleHelper.get_assets_dir()
        assert assets_dir is not None
        assert str(assets_dir).endswith("signaction_assets")

    def test_kaggle_availability_check(self):
        """Test Kaggle availability detection (may return False if not installed)."""
        # This test doesn't fail - it just verifies the method works
        is_available = KaggleHelper.is_available()
        assert isinstance(is_available, bool)

    def test_setup_instructions(self):
        """Test that setup instructions are available."""
        instructions = KaggleHelper.get_setup_instructions()
        assert instructions is not None
        assert "kaggle" in instructions.lower()
        assert "json" in instructions.lower()
