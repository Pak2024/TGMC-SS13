/// Adds the currently active tutorial objective to the mob's status panel.
///
/// Nothing attaches this component yet; the player/lobby integration is added
/// in a later stage. Keeping it as a component makes the eventual integration
/// independent from the tutorial datum itself.
/datum/component/tutorial_status
	dupe_mode = COMPONENT_DUPE_UNIQUE

	var/tutorial_status = ""


/datum/component/tutorial_status/Initialize()
	. = ..()
	if(!ismob(parent))
		return COMPONENT_INCOMPATIBLE


/datum/component/tutorial_status/RegisterWithParent()
	. = ..()

	RegisterSignal(parent, COMSIG_TUTORIAL_OBJECTIVE_UPDATED, PROC_REF(update_objective))
	RegisterSignal(parent, COMSIG_MOB_GET_STATUS_TAB_ITEMS, PROC_REF(get_status_tab_item))


/datum/component/tutorial_status/UnregisterFromParent()
	UnregisterSignal(parent, list(
		COMSIG_TUTORIAL_OBJECTIVE_UPDATED,
		COMSIG_MOB_GET_STATUS_TAB_ITEMS
	))
	return ..()


/datum/component/tutorial_status/proc/update_objective(datum/source, objective_text)
	SIGNAL_HANDLER

	tutorial_status = objective_text


/datum/component/tutorial_status/proc/get_status_tab_item(datum/source, list/status_tab_items)
	SIGNAL_HANDLER

	if(tutorial_status)
		status_tab_items += "Tutorial Objective: [tutorial_status]"
