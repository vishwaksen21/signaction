#!/usr/bin/env python3
"""
Diagnose Kaggle setup and connection issues.
"""

import sys
import subprocess
from pathlib import Path


def check_kaggle_cli():
    """Check if kaggle CLI is installed."""
    try:
        result = subprocess.run(
            ["kaggle", "--version"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        print(f"✓ Kaggle CLI installed: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("✗ Kaggle CLI not found")
        print("  Install with: pip install kaggle")
        return False
    except Exception as e:
        print(f"✗ Error checking kaggle CLI: {e}")
        return False


def check_credentials():
    """Check if Kaggle credentials are configured."""
    cred_file = Path.home() / ".kaggle" / "kaggle.json"
    
    if not cred_file.exists():
        print(f"✗ Credentials file not found: {cred_file}")
        print("\n  Setup instructions:")
        print("  1. Go to: https://www.kaggle.com/settings/account")
        print("  2. Click 'Create New API Token'")
        print("  3. Save kaggle.json to ~/.kaggle/")
        print("  4. Run: chmod 600 ~/.kaggle/kaggle.json")
        return False
    
    # Check permissions
    perms = cred_file.stat().st_mode & 0o777
    if perms != 0o600:
        print(f"⚠ Credentials file permissions are {oct(perms)} (should be 0o600)")
        print(f"  Fixing: chmod 600 {cred_file}")
        cred_file.chmod(0o600)
    else:
        print(f"✓ Credentials file found: {cred_file}")
        print(f"✓ Credentials file permissions: 0o600 (secure)")
    
    return True


def test_kaggle_connection():
    """Test Kaggle API connection."""
    try:
        result = subprocess.run(
            ["kaggle", "datasets", "list", "-s", "asl"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        
        if result.returncode == 0:
            print("✓ Kaggle API connection successful!")
            lines = result.stdout.strip().split('\n')
            print(f"  Found {len(lines)} datasets matching 'asl'")
            if len(lines) > 1:
                print(f"  Sample: {lines[0]}")
            return True
        else:
            print(f"✗ Kaggle API error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("✗ Kaggle API timeout (no internet connection?)")
        return False
    except Exception as e:
        print(f"✗ Error testing connection: {e}")
        return False


def list_available_datasets():
    """List some available ASL datasets on Kaggle."""
    print("\nSearching for available ASL datasets on Kaggle...")
    
    try:
        result = subprocess.run(
            ["kaggle", "datasets", "list", "-s", "sign language"],
            capture_output=True,
            text=True,
            timeout=15,
        )
        
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            print(f"\nFound {len(lines)} sign language datasets:")
            for line in lines[:10]:  # Show first 10
                print(f"  {line}")
            if len(lines) > 10:
                print(f"  ... and {len(lines) - 10} more")
        else:
            print(f"Could not list datasets: {result.stderr}")
    except Exception as e:
        print(f"Error listing datasets: {e}")


def main():
    print("╔════════════════════════════════════════════════════╗")
    print("║       Kaggle Setup Diagnostic Tool                 ║")
    print("╚════════════════════════════════════════════════════╝\n")
    
    checks = [
        ("Kaggle CLI", check_kaggle_cli()),
        ("Credentials", check_credentials()),
    ]
    
    if all(result for _, result in checks):
        print("\n" + "=" * 52)
        print("Testing API connection...\n")
        if test_kaggle_connection():
            print("\n" + "=" * 52)
            print("✓ All checks passed! Ready to download datasets.\n")
            list_available_datasets()
        else:
            print("\n" + "=" * 52)
            print("✗ Connection failed. Check credentials or internet.\n")
            sys.exit(1)
    else:
        print("\n" + "=" * 52)
        print("✗ Setup incomplete. Fix the issues above.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
