/// Runtime registry and owner for tutorial instances.
/datum/tutorial_manager
	var/list/tutorial_types = list()
	var/list/active_tutorials = list()


/datum/tutorial_manager/proc/register_tutorial(typepath)
	if(!ispath(typepath, /datum/tutorial))
		return FALSE

	var/datum/tutorial/template = new typepath()
	var/id = template.tutorial_id
	qdel(template)

	if(!id || tutorial_types[id])
		return FALSE

	tutorial_types[id] = typepath
	return TRUE


/datum/tutorial_manager/proc/get_tutorial_type(tutorial_id)
	return tutorial_types[tutorial_id]


/datum/tutorial_manager/proc/start_tutorial(tutorial_id, mob/starting_mob)
	if(!starting_mob || !tutorial_id)
		return null

	var/typepath = get_tutorial_type(tutorial_id)
	if(!typepath)
		return null

	var/datum/tutorial/tutorial = new typepath(starting_mob)
	if(!tutorial.start_tutorial())
		qdel(tutorial)
		return null

	active_tutorials[tutorial] = TRUE
	return tutorial


/datum/tutorial_manager/proc/end_tutorial(datum/tutorial/tutorial, completed = FALSE)
	if(!tutorial)
		return

	if(completed)
		tutorial.complete_tutorial()
	else
		tutorial.end_tutorial()

	active_tutorials -= tutorial
	qdel(tutorial)
