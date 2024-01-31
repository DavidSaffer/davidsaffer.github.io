#!/bin/bash

# Define the file extensions to search for
EXTENSIONS=("html" "js" "css")

# Define output file
OUTPUT_FILE="output.txt"

# Clear the output file
> "$OUTPUT_FILE"

# Function to process files
process_files() {
    for file in *."$1"; do
        if [ -f "$file" ]; then
            echo "Filename: $file" >> "$OUTPUT_FILE"
            cat "$file" >> "$OUTPUT_FILE"  # Change the number 10 to how many lines you want to include from each file
            echo "---- End of $file ----" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
        fi
    done
}

# Loop through each extension and process files
for ext in "${EXTENSIONS[@]}"; do
    process_files "$ext"
done

echo "Output written to $OUTPUT_FILE"
