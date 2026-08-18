/datum/tutorial/marine_basic
	tutorial_id = "marine_basic"
	name = "Marine Basic Tutorial"
	category = TUTORIAL_CATEGORY_MARINE


/datum/tutorial/marine_basic/build_steps()
	add_step(new /datum/tutorial_step/marine_basic/intro(src))
	add_step(new /datum/tutorial_step/marine_basic/movement(src))
	add_step(new /datum/tutorial_step/marine_basic/combat(src))


/datum/tutorial_step/marine_basic/intro
	objective = "Welcome to the Marine Basic Tutorial."


/datum/tutorial_step/marine_basic/movement
	objective = "Learn how to move your Marine."


/datum/tutorial_step/marine_basic/combat
	objective = "Learn the basics of combat."
