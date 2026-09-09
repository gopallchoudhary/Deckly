## Overall
    So this project named Deckly is a platform where users can create decks to pitch to the inverstor or to someone else using AI

## User flow
    / -> Landing page where only the logged out users can visit (will build landing page at last)
    /dashboard -> this page contains the user input form and their created Decks (I'll share the rough UI)
    /deck/:deckId -> on clicking the existing deck or creating a new deck user should be redirected to this page

## Next steps
    - write the actions for the decks (create, list, delete, create will have inngest.send) in the src/features/deck/actions/index.ts
    - write the hooks for decks using tanstack react query in src/features/decks/hooks
    - for all the required components for the deck create in src/features/decks/components
    - and for the components for the slides create in src/features/slides/components
    - to show the slides in /deck/:deckId -> use the embla carousel react (already installed)
    