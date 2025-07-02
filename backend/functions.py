# functions.py

# Schema definitions for OpenAI Function Calling
NAVIGATE_SCHEMA_REACT = {
    "name": "navigate_to_page",
    "description": "Instruct the frontend to navigate to a specific route or page",
    "parameters": {
        "type": "object",
        "properties": {
            "page": {
                "type": "string",
                "description": "The React Router path or URL to navigate to"
            }
        },
        "required": ["page"]
    }
}

# entry for all functions, just like module.exports()
FUNCTIONS = [
    NAVIGATE_SCHEMA_REACT,
    # e.g. UPDATE_USER_PROFILE_SCHEMA,
    #      FETCH_STATS_SCHEMA,
]
