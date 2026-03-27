import pandas as pd
try:
    df = pd.read_excel('All Activities.xlsx', nrows=5)
    print(df['Duration'].head())
    print(type(df['Duration'].iloc[0]))
except Exception as e:
    print(e)
