// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { AppLayout, HelpPanel, Icon, Wizard } from '@cloudscape-design/components';
import { Breadcrumbs, Navigation } from './wizard-components.jsx';
import { appLayoutLabels } from '../../common/labels';
import Engine from './stepComponents/step1.jsx';
import Details from './stepComponents/step2.jsx';
import Advanced from './stepComponents/step3.jsx';
import Review from './stepComponents/step4.jsx';
import { DEFAULT_STEP_INFO, TOOLS_CONTENT } from './steps-config';
import { ExternalLinkItem, InfoLink, Notifications } from '../commons/common-components';
import '../../styles/wizard.scss';

const steps = [
  {
    title: 'Select engine type',
    stateKey: 'engine',
    StepContent: Engine,
  },
  {
    title: 'Specify instance details',
    stateKey: 'details',
    StepContent: Details,
  },
  {
    title: 'Configure settings',
    stateKey: 'advanced',
    StepContent: Advanced,
  },
  {
    title: 'Review and create',
    stateKey: 'review',
    StepContent: Review,
  },
];

const i18nStrings = {
  stepNumberLabel: stepNumber => `Step ${stepNumber}`,
  collapsedStepsLabel: (stepNumber, stepsCount) => `Step ${stepNumber} of ${stepsCount}`,
  cancelButton: 'Cancel',
  previousButton: 'Previous',
  nextButton: 'Next',
  submitButton: 'Create DB instance',
  optional: 'optional',
};

const getDefaultToolsContent = activeIndex => TOOLS_CONTENT[steps[activeIndex].stateKey].default;

const getFormattedToolsContent = tools => (
  <HelpPanel
    header={<h2>{tools.title}</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
          {tools.links.map((link, i) => (
            <li key={i}>
              <ExternalLinkItem href={link.href} text={link.text} />
            </li>
          ))}
        </ul>
      </>
    }
  >
    {tools.content}
  </HelpPanel>
);

const useTools = () => {
  const [toolsContent, setToolsContent] = useState(getFormattedToolsContent(getDefaultToolsContent(0)));
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const setFormattedToolsContent = tools => {
    setToolsContent(getFormattedToolsContent(tools));
  };

  const openTools = tools => {
    if (tools) {
      setFormattedToolsContent(tools);
    }
    setIsToolsOpen(true);
  };
  const closeTools = () => setIsToolsOpen(false);

  const onToolsChange = evt => setIsToolsOpen(evt.detail.open);

  return {
    toolsContent,
    isToolsOpen,
    openTools,
    closeTools,
    setFormattedToolsContent,
    onToolsChange,
  };
};

const useWizard = (closeTools, setFormattedToolsContent) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepsInfo, setStepsInfo] = useState(DEFAULT_STEP_INFO);

  const onStepInfoChange = useCallback(
    (stateKey, newStepState) => {
      setStepsInfo({
        ...stepsInfo,
        [stateKey]: {
          ...stepsInfo[stateKey],
          ...newStepState,
        },
      });
    },
    [stepsInfo]
  );

  const setActiveStepIndexAndCloseTools = index => {
    setActiveStepIndex(index);
    setFormattedToolsContent(getDefaultToolsContent(index));
    closeTools();
  };

  const onNavigate = evt => {
    setActiveStepIndexAndCloseTools(evt.detail.requestedStepIndex);
  };

  const onCancel = () => {
    console.log('Cancel');
  };

  const onSubmit = () => {
    console.log(stepsInfo);
  };

  return {
    activeStepIndex,
    stepsInfo,
    setActiveStepIndexAndCloseTools,
    onStepInfoChange,
    onNavigate,
    onCancel,
    onSubmit,
  };
};

const App = () => {
  const { toolsContent, isToolsOpen, openTools, closeTools, setFormattedToolsContent, onToolsChange } = useTools();
  const {
    activeStepIndex,
    stepsInfo,
    setActiveStepIndexAndCloseTools,
    onStepInfoChange,
    onNavigate,
    onCancel,
    onSubmit,
  } = useWizard(closeTools, setFormattedToolsContent);

  const wizardSteps = steps.map(({ title, stateKey, StepContent }) => ({
    title,
    info: (
      <InfoLink onFollow={() => openTools(TOOLS_CONTENT[stateKey].default)} ariaLabel={`Information about ${title}.`} />
    ),
    content: (
      <StepContent
        info={stepsInfo}
        onChange={newStepState => onStepInfoChange(stateKey, newStepState)}
        openTools={openTools}
        setActiveStepIndex={setActiveStepIndexAndCloseTools}
      />
    ),
  }));
  return (
    <AppLayout
      headerSelector="#header"
      navigation={<Navigation />}
      tools={toolsContent}
      toolsOpen={isToolsOpen}
      onToolsChange={onToolsChange}
      breadcrumbs={<Breadcrumbs />}
      contentType="wizard"
      content={
        <Wizard
          steps={wizardSteps}
          activeStepIndex={activeStepIndex}
          i18nStrings={i18nStrings}
          onNavigate={onNavigate}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      }
      ariaLabels={appLayoutLabels}
      notifications={<Notifications />}
    />
  );
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
