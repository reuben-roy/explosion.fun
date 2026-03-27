import pandas as pd
try:
    df = pd.read_excel('All Activities.xlsx')
    print(f"Total rows: {len(df)}")
    print("Columns:", df.columns.tolist())
    
    # Check Start Date
    if 'Start Date' in df.columns:
        print("\nSample Start Dates (Raw):")
        print(df['Start Date'].head())
        print(df['Start Date'].tail())
        
        df['Start_DT'] = pd.to_datetime(df['Start Date'], errors='coerce')
        print(f"\nParsed Dates: {df['Start_DT'].count()} valid out of {len(df)}")
        print(f"Min Date: {df['Start_DT'].min()}")
        print(f"Max Date: {df['Start_DT'].max()}")
        print(f"Unique Days: {df['Start_DT'].dt.date.nunique()}")
        
except Exception as e:
    print(e)
