ADMIN_VERB_AND_CONTEXT_MENU(test_marine_tutorial, R_DEBUG, "Test Marine Tutorial", "Start the TGMC Marine Basic Tutorial on yourself.", ADMIN_CATEGORY_DEBUG)
	var/mob/M = user.mob
	if(!M)
		return

	if(!SStutorial || !SStutorial.manager)
		to_chat(user, span_warning("Tutorial subsystem is not initialized."))
		return

	var/datum/tutorial/tutorial = SStutorial.manager.start_tutorial("marine_basic", M)
	if(!tutorial)
		to_chat(user, span_warning("Failed to start Marine Basic Tutorial."))
		return

	to_chat(user, span_notice("Marine Basic Tutorial started."))
	to_chat(user, span_notice("Objective: [tutorial.current_objective]"))

ADMIN_VERB_AND_CONTEXT_MENU(test_tutorial_menu, R_DEBUG, "Test Tutorial Menu", "Open the TGMC Tutorial Menu.", ADMIN_CATEGORY_DEBUG)
	if(!user.mob)
		return

	GLOB.tutorial_menu.ui_interact(user.mob)
