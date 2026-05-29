def clean_water_condition(condition):
    """
    Clean the water condition input.
    Convert 'contaminated' (case-insensitive) to 1, else 0.
    """
    if not condition:
        return 0
    
    cleaned = str(condition).strip().lower()
    if 'contaminated' in cleaned or cleaned == 'dirty' or cleaned == 'unclean' or cleaned == 'polluted':
        return 1
    return 0
