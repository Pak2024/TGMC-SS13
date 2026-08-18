import { useState } from 'react';
import {
	Box,
	Button,
	Divider,
	Section,
	Stack,
	Tabs,
} from 'tgui-core/components';
import { classes } from 'tgui-core/react';

import { useBackend } from '../backend';
import { Window } from '../layouts';

type Tutorial = {
	name: string;
	path: string;
	id: string;
	description: string;
	image: string;
};

type TutorialCategory = {
	tutorials: Tutorial[];
	name: string;
};

type BackendContext = {
	tutorial_categories: TutorialCategory[];
	completed_tutorials: string[];
	locked_tutorials: string[];
};

export const TutorialMenu = (props) => {
	const { data, act } = useBackend<BackendContext>();
	const {
		tutorial_categories,
		completed_tutorials,
		locked_tutorials,
	} = data;

	const [chosenTutorial, setTutorial] = useState<Tutorial | null>(null);
	const [categoryIndex, setCategoryIndex] = useState('Marine');

	return (
		<Window title="Tutorial Menu" width={800} height={600}>
			<Window.Content>
				<Stack fill vertical>
					<Stack.Item>
						<Tabs>
							{tutorial_categories.map((item) => (
								<Tabs.Tab
									key={item.name}
									selected={item.name === categoryIndex}
									onClick={() => setCategoryIndex(item.name)}
								>
									{item.name}
								</Tabs.Tab>
							))}
						</Tabs>
					</Stack.Item>

					<Stack fill>
						<Stack.Item grow mr={1}>
							<Section fill height="100%">
								{tutorial_categories.map(
									(tutorial_category) =>
										tutorial_category.name === categoryIndex &&
										tutorial_category.tutorials
											.sort((a, b) => (a.name < b.name ? -1 : 1))
											.map((tutorial) => (
												<div
													style={{ paddingBottom: '12px' }}
													key={tutorial.id}
												>
													<Button
														fontSize="15px"
														textAlign="center"
														selected={tutorial === chosenTutorial}
														color={
															completed_tutorials.indexOf(tutorial.id) === -1
																? 'good'
																: 'default'
														}
														width="100%"
														disabled={
															locked_tutorials.indexOf(tutorial.id) !== -1
														}
														onClick={() => setTutorial(tutorial)}
													>
														{tutorial.name}
													</Button>
												</div>
											)),
								)}
							</Section>
						</Stack.Item>

						<Divider vertical />

						<Stack.Item width="30%">
							<Section title="Selected Tutorial">
								{chosenTutorial !== null ? (
									<Stack vertical>
										<Stack.Item>
											<Box>
												<span
													className={classes([
														'tutorial128x128',
														`${chosenTutorial.image}`,
													])}
												/>
											</Box>
										</Stack.Item>

										<Stack.Item>
											{chosenTutorial.description}
										</Stack.Item>

										{completed_tutorials.indexOf(chosenTutorial.id) !== -1 && (
											<Stack.Item>
												Tutorial has been completed.
											</Stack.Item>
										)}

										<Stack.Item>
											<Button
												textAlign="center"
												width="100%"
												onClick={() =>
													act('select_tutorial', {
														tutorial_path: chosenTutorial.path,
													})
												}
											>
												Start Tutorial
											</Button>
										</Stack.Item>
									</Stack>
								) : (
									<div />
								)}
							</Section>
						</Stack.Item>
					</Stack>
				</Stack>
			</Window.Content>
		</Window>
	);
};
