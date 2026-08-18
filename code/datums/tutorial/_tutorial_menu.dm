GLOBAL_DATUM_INIT(tutorial_menu, /datum/tutorial_menu, new)

/datum/tutorial_menu
	var/static/list/categories = list()


/datum/tutorial_menu/New()
	. = ..()

	if(length(categories))
		return

	var/list/categories_2 = list()

	for(var/datum/tutorial/tutorial as anything in subtypesof(/datum/tutorial))
		if(tutorial::parent_path == tutorial)
			continue

		if(!(tutorial::category in categories_2))
			categories_2[tutorial::category] = list()

		categories_2[tutorial::category] += list(list(
			"name" = tutorial::name,
			"path" = "[tutorial]",
			"id" = tutorial::tutorial_id,
			"description" = tutorial::desc,
			"image" = tutorial::icon_state,
		))

	for(var/category in categories_2)
		categories += list(list(
			"name" = category,
			"tutorials" = categories_2[category],
		))

/datum/tutorial_menu/ui_state(mob/user)
	return GLOB.new_player_state


/datum/tutorial_menu/ui_static_data(mob/user)
	var/list/data = list()

	data["tutorial_categories"] = categories
	data["completed_tutorials"] = list()
	data["locked_tutorials"] = list()

	return data

/datum/tutorial_menu/ui_interact(mob/user, datum/tgui/ui)
	ui = SStgui.try_update_ui(user, src, ui)

	if(!ui)
		ui = new(user, src, "TutorialMenu", "Tutorials")
		ui.open()

/datum/tutorial_menu/ui_act(action, list/params, datum/tgui/ui, datum/ui_state/state)
	. = ..()

	if(.)
		return

	if(action != "select_tutorial")
		return

	var/datum/tutorial/path

	if(!params["tutorial_path"])
		return

	path = text2path(params["tutorial_path"])

	if(!ispath(path, /datum/tutorial))
		return

	if(!isnewplayer(ui.user))
		return

	var/mob/new_player/new_player = ui.user

	if(SStutorial?.manager)
		for(var/datum/tutorial/tutorial in SStutorial.manager.active_tutorials)
			if(tutorial?.tutorial_mob == new_player)
				to_chat(new_player, span_notice("You are already in a tutorial."))
				return

	var/datum/tutorial/tutorial = new path

	if(tutorial.start_tutorial(new_player))
		ui.close()
		return TRUE
