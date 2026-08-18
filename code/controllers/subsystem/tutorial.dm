SUBSYSTEM_DEF(tutorial)
	name = "Tutorials"
	flags = SS_NO_FIRE
	init_order = INIT_ORDER_DEFAULT

	var/datum/tutorial_manager/manager


/datum/controller/subsystem/tutorial/Initialize(timeofday)
	manager = new

	manager.register_tutorial(/datum/tutorial/marine_basic)

	return SS_INIT_SUCCESS


/datum/controller/subsystem/tutorial/Shutdown()
	if(!manager)
		return

	for(var/datum/tutorial/tutorial as anything in manager.active_tutorials)
		if(QDELETED(tutorial))
			continue

		tutorial.end_tutorial()
		qdel(tutorial)

	manager.active_tutorials.Cut()
	QDEL_NULL(manager)
