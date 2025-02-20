// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState } from 'react';
import { Container, Header, TagEditor } from '@cloudscape-design/components';
import { InfoLink } from '../../commons/common-components';
import { tagEditor as i18nStrings } from '../../../common/i18nStrings';

export default function TagsPanel({ updateTools, readOnlyWithErrors = false }) {
  const [tags, setTags] = useState([{ key: '', value: '' }]);

  return (
    <Container
      id="tags-panel"
      header={
        <Header
          variant="h2"
          info={<InfoLink onFollow={() => updateTools(10)} ariaLabel={'Information about tags.'} />}
          description="A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs."
        >
          Tags
        </Header>
      }
    >
      <TagEditor
        i18nStrings={i18nStrings}
        tags={tags}
        onChange={({ detail }) => {
          const { tags } = detail;
          !readOnlyWithErrors && setTags(tags);
        }}
        keysRequest={() => window.FakeServer.GetTagKeys().then(({ TagKeys }) => TagKeys)}
        valuesRequest={key => window.FakeServer.GetTagValues(key).then(({ TagValues }) => TagValues)}
      />
    </Container>
  );
}
