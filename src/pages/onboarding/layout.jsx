// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect } from 'react';
import { AppLayout, Tabs, TutorialPanel } from '@cloudscape-design/components';
import { appLayoutLabels } from '../../common/labels';
import { tutorialPanelI18nStrings } from './i18n';
import { helpPanelContent } from './help-panel-content';
import { useStore } from './store';
import { Notifications } from '../commons/common-components';

export function CustomAppLayout({ initialHelpPanelPage, ...props }) {
  const { state, actions } = useStore();

  useEffect(() => {
    actions.setHelpPanelTopic(initialHelpPanelPage);
    // update only on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tutorialPdfDownloadUrl = window.location.href;

  return (
    <AppLayout
      navigationOpen={false}
      onNavigationChange={() => {
        /*this functionality is not represented in this demo*/
      }}
      headerSelector="#header"
      ariaLabels={appLayoutLabels}
      toolsOpen={state.toolsOpen}
      onToolsChange={event => actions.setToolsOpen(event.detail.open)}
      toolsWidth={330}
      notifications={<Notifications />}
      tools={
        <Tabs
          activeTabId={state.toolsTab}
          onChange={event => actions.setToolsTab(event.detail.activeTabId)}
          tabs={[
            { id: 'help-panel', label: 'Info', content: helpPanelContent[state.helpPanelTopic] },
            {
              id: 'tutorials-panel',
              label: 'Tutorials',
              content: (
                <TutorialPanel
                  i18nStrings={tutorialPanelI18nStrings}
                  tutorials={state.tutorials}
                  onFeedbackClick={() => window.prompt('Please enter your feedback here (this will not be saved):')}
                  downloadUrl={tutorialPdfDownloadUrl}
                />
              ),
            },
          ]}
        />
      }
      {...props}
    />
  );
}
