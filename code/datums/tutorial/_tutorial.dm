/// Base tutorial datum.
///
/// Concrete tutorials should inherit this datum and populate `steps` in
/// build_steps(). The datum deliberately does not depend on any map
/// reservation, lobby UI, preferences or CM-only systems yet.
/datum/tutorial
	var/tutorial_id = TUTORIAL_DEFAULT_ID
	var/name = "Tutorial"
	var/category = TUTORIAL_CATEGORY_MARINE

	/// Mob currently taking this tutorial.
	var/mob/tutorial_mob

	/// 1-based index of the current lesson.
	var/current_step = 0

	/// One of the TUTORIAL_STATUS_* values.
	var/status = 0

	/// Ordered list of /datum/tutorial_step.
	var/list/steps = list()

	/// Temporary atoms watched by a tutorial step.
	var/list/tracking_atoms = list()

	/// Current objective displayed by future UI/status integration.
	var/current_objective = ""

	/// Prevents duplicate completion/cleanup.
	var/ending = FALSE

	var/desc = ""

	var/icon_state = ""

	var/parent_path = /datum/tutorial

/datum/tutorial/New(mob/starting_mob)
	. = ..()
	if(starting_mob)
		tutorial_mob = starting_mob
	build_steps()


/datum/tutorial/proc/build_steps()
	/// Override in a concrete tutorial.
	return


/datum/tutorial/proc/start_tutorial()
	if(ending || !tutorial_mob || status)
		return FALSE

	status = TUTORIAL_STATUS_ACTIVE
	current_step = 1

	SEND_SIGNAL(tutorial_mob, COMSIG_TUTORIAL_STARTED, src)
	on_start()

	if(!length(steps))
		update_objective("")
		return TRUE

	return enter_step(current_step)


/datum/tutorial/proc/on_start()
	/// Override in a concrete tutorial.
	return


/datum/tutorial/proc/on_complete()
	/// Override in a concrete tutorial.
	return


/datum/tutorial/proc/on_fail()
	/// Override in a concrete tutorial.
	return


/datum/tutorial/proc/enter_step(step_index)
	if(step_index < 1 || step_index > length(steps))
		return FALSE

	current_step = step_index
	var/datum/tutorial_step/step = steps[step_index]
	if(!step)
		return FALSE

	step.on_enter(src)
	update_objective(step.objective)
	return TRUE


/datum/tutorial/proc/next_step()
	if(!is_active())
		return FALSE

	var/datum/tutorial_step/current = get_current_step()
	if(current)
		current.on_exit(src)

	if(current_step >= length(steps))
		return complete_tutorial()

	return enter_step(current_step + 1)


/datum/tutorial/proc/previous_step()
	if(!is_active() || current_step <= 1)
		return FALSE

	var/datum/tutorial_step/current = get_current_step()
	if(current)
		current.on_exit(src)

	return enter_step(current_step - 1)


/datum/tutorial/proc/get_current_step()
	if(current_step < 1 || current_step > length(steps))
		return null
	return steps[current_step]


/datum/tutorial/proc/add_step(datum/tutorial_step/step)
	if(!step)
		return FALSE

	steps += step
	return TRUE


/datum/tutorial/proc/update_objective(message)
	current_objective = message || ""

	if(tutorial_mob)
		SEND_SIGNAL(tutorial_mob, COMSIG_TUTORIAL_OBJECTIVE_UPDATED, current_objective)


/datum/tutorial/proc/add_to_tracking_atoms(atom/reference)
	if(!reference)
		return FALSE

	tracking_atoms[reference] = TRUE
	return TRUE


/datum/tutorial/proc/remove_from_tracking_atoms(atom/reference)
	if(!reference)
		return FALSE

	tracking_atoms -= reference
	return TRUE


/datum/tutorial/proc/is_tracking(atom/reference)
	return !!reference && !!tracking_atoms[reference]


/datum/tutorial/proc/is_active()
	return status == TUTORIAL_STATUS_ACTIVE && !ending


/datum/tutorial/proc/complete_tutorial()
	if(ending || status == TUTORIAL_STATUS_COMPLETED)
		return FALSE

	var/datum/tutorial_step/current = get_current_step()
	if(current)
		current.on_exit(src)

	status = TUTORIAL_STATUS_COMPLETED
	ending = TRUE

	on_complete()

	if(tutorial_mob)
		SEND_SIGNAL(tutorial_mob, COMSIG_TUTORIAL_COMPLETED, src)

	return TRUE


/datum/tutorial/proc/fail_tutorial()
	if(ending)
		return FALSE

	ending = TRUE
	on_fail()
	return TRUE


/datum/tutorial/proc/end_tutorial()
	if(ending)
		return

	var/datum/tutorial_step/current = get_current_step()
	if(current)
		current.on_exit(src)

	ending = TRUE


/datum/tutorial/Destroy(force)
	tutorial_mob = null
	steps.Cut()
	tracking_atoms.Cut()
	return ..()
