
# clean_lab_data.py
# Author: Movlan Aliyev
# Project: Global Lab Test Dashboard - Data Cleaning Script

import pandas as pd
import os

# Set paths
input_path = '../data/lab_tests_sample.csv'  # Adjust if your CSV name is different
output_path = '../data/lab_tests_cleaned.csv'

# Read raw data
print("Reading raw lab test data...")
df = pd.read_csv(input_path)

# Basic Cleaning
print("Cleaning data...")
df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')  # Standardize column names
df['collection_time'] = pd.to_datetime(df['collection_time'], errors='coerce')  # Fix date fields
df = df.dropna(subset=['test_id', 'hospital_id', 'collection_time'])  # Drop rows missing key fields

# Feature Engineering
print("Engineering new features...")
df['days_since_collection'] = (pd.Timestamp.today() - df['collection_time']).dt.days

# Export Cleaned Data
print(f"Saving cleaned data to {output_path}...")
df.to_csv(output_path, index=False)

print("✅ Data cleaning complete!")
