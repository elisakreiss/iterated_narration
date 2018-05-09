# Ideas for non-dallinger solution

### Status file
= a file that is necessary to ensure iterated MTurk recruitment

- info that needs to be saved
	- **chain_id**: unique id that is generated in the beginning of a chain and enables unique identification
	- **cover_story**: for first participant in the chain, a cover story is randomly chosen (lawyer, party, control) and saved in this variable; for all other subsequent participants in the chain, they load the cover_story that is saved here
	- **seed**: original seed that was randomly chosen for first participant
	- **response**: (at least) last reproduction of the story, which is to be loaded for the next participant

### What to run
- 01_pilot
	- 2 cover stories (lawyer, party)
	- 2 seeds
	- 5 chains per seed
	- 5 generations per chain

