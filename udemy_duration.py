"""
This script processes a JSON file containing course data, extracts and converts course durations, 
and outputs a sorted CSV file along with the total duration of all courses.

Script functionality:
1. Load the JSON data from 'courses_with_duration.json'.
2. Convert the JSON data into a pandas DataFrame.
3. Define a function to convert course durations from hours to seconds.
4. Apply the conversion function to the 'duration' column to create a new 'duration_seconds' column.
5. Sort the DataFrame in ascending order based on the 'duration_seconds' column.
6. Calculate the total duration of all courses in seconds.
7. Convert the total duration from seconds to 'hh:mm:ss' format.
8. Drop the 'duration_seconds' column from the DataFrame.
9. Save the sorted DataFrame to a CSV file named 'courses_sorted_by_duration.csv'.
10. Print the total duration of all courses in 'hh:mm:ss' format.

Usage:
- Ensure the 'courses_with_duration.json' file is in the same directory as this script.
- Run the script to generate 'courses_sorted_by_duration.csv' and print the total duration.

Note:
- The 'duration' field in the JSON file should be in a format that can be parsed as a float number of hours.
"""

import json
import pandas as pd

# Load the JSON data from the file
with open('courses_with_duration.json', 'r') as file:
    courses = json.load(file)

# Convert the JSON data to a DataFrame
df = pd.DataFrame(courses)

# Convert the duration column to a uniform time format (seconds)
def convert_duration_to_seconds(duration_str):
    try:
        hours = float(duration_str.split()[0])
        return hours * 3600  # Convert hours to seconds
    except Exception as e:
        print(f"Error converting duration: {e}")
        return 0

df['duration_seconds'] = df['duration'].apply(convert_duration_to_seconds)

# Order the rows in descending order based on the duration
df_sorted = df.sort_values(by='duration_seconds', ascending=True)

# Calculate the total duration in seconds
total_duration_seconds = df_sorted['duration_seconds'].sum()

# Convert the total duration back to 'hh:mm:ss' format
total_duration_hours = total_duration_seconds // 3600
total_duration_minutes = (total_duration_seconds % 3600) // 60
total_duration_seconds = total_duration_seconds % 60

total_duration_str = f"{total_duration_hours:02}:{total_duration_minutes:02}:{total_duration_seconds:02}"

# Remove the duration_seconds column before saving to CSV
df_sorted.drop(columns=['duration_seconds'], inplace=True)

# Save the sorted DataFrame to a CSV file
df_sorted.to_csv('courses_sorted_by_duration.csv', index=False)

# Print the total duration
print(f"Total duration of all courses: {total_duration_str}")
