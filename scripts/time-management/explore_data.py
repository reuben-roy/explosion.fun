import pandas as pd
import json

try:
    with open('activities_data.json', 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    # Check unique projects
    print("Projects:", df['Project'].unique())
    
    # Check unique Applications
    print("Applications:", df['Application'].unique())
    
    # Check top domains in Path (simple split)
    if 'Path' in df.columns:
        # Handle nan paths
        df['Path'] = df['Path'].fillna('')
        df['Domain'] = df['Path'].astype(str).apply(lambda x: x.split('/')[2] if x.startswith('http') else 'None')
        print("\nTop Domains in Web Browsing:")
        print(df[df['Project'] == 'Web Browsing']['Domain'].value_counts().head(20))
        
    # Check top titles for 'Web Browsing'
    web_browsing = df[df['Project'] == 'Web Browsing']
    print("\nTop Web Browsing Titles:")
    print(web_browsing['Title'].value_counts().head(20))

except Exception as e:
    print(e)
