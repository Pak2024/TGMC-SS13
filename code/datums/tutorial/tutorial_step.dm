/// One lesson inside a tutorial.
/datum/tutorial_step
	/// Text shown while this step is active.
	var/objective = ""

	/// Tutorial owning this step.
	var/datum/tutorial/tutorial


/datum/tutorial_step/New(datum/tutorial/owner)
	. = ..()
	tutorial = owner


/datum/tutorial_step/proc/on_enter(datum/tutorial/owner)
	tutorial = owner


/datum/tutorial_step/proc/on_exit(datum/tutorial/owner)
	return


/datum/tutorial_step/proc/check_complete(datum/tutorial/owner)
	return FALSE
