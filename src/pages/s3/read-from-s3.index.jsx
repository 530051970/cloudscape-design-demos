// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';

import {
  AppLayout,
  BreadcrumbGroup,
  Button,
  Container,
  ContentLayout,
  Header,
  Form,
  FormField,
  SpaceBetween,
  S3ResourceSelector,
} from '@cloudscape-design/components';
import { Navigation, Notifications } from '../commons/common-components';
import { appLayoutLabels } from '../../common/labels';
import { readFromS3Breadcrumbs } from '../../common/breadcrumbs';
import { i18nStrings } from '../../common/s3-resource-selector/i18n-strings';
import { getItems, requestAsyncAttribute } from '../../common/s3-resource-selector/mock-request';
import { ErrorAlert } from './common';

import '../../styles/base.scss';

const Breadcrumbs = () => (
  <BreadcrumbGroup items={readFromS3Breadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

class S3ResourceSelectorContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      serverSideError: null,
      resource: { uri: '' },
      alert: null,
      errorText: null,
      viewHref: '',
    };
    this.onChange = this.onChange.bind(this);
  }

  async fetch(resourceType, bucket, path) {
    this.setState({ serverSideError: null });

    try {
      const result = await getItems(resourceType, bucket, path);
      if (resourceType === 'buckets') {
        await Promise.all(result.map(bucket => requestAsyncAttribute(bucket, 'Region')));
      }
      return result;
    } catch (error) {
      this.setState({
        serverSideError: error,
      });
      throw error;
    }
  }

  //
  // Resource has been confirmed:
  // Modal submit / Version picker selection / Uri input field change event
  //
  onChange({ detail }) {
    const { resource, errorText } = detail;

    this.setState({
      errorText,
      resource,
      viewHref: resource.uri !== '' && !errorText ? 'https://amazons3.demo.s3-resource-selector/test/1' : '',
    });
  }

  render() {
    const { errorText, resource, serverSideError, viewHref } = this.state;
    const s3ResourceSelectorProps = {
      alert: serverSideError && <ErrorAlert error={serverSideError} />,
      resource: resource,
      viewHref: viewHref,
      selectableItemsTypes: ['objects', 'versions'],
      objectsIsItemDisabled: object => object.IsFolder,
      bucketsVisibleColumns: ['Name', 'Region', 'CreationDate'],
      i18nStrings,
      fetchBuckets: () => this.fetch('buckets'),
      fetchObjects: (bucket, path) => this.fetch('objects', bucket, path),
      fetchVersions: (bucket, path) => this.fetch('versions', bucket, path),
      onChange: this.onChange,
    };
    return (
      <FormField
        label="Read simulations from S3"
        description="Choose a simulation in Amazon S3. Amazon S3 is object storage built to store and retrieve data."
        constraintText="Format: s3://bucket/prefix/object. For objects in a bucket with versioning activated, you can choose the most recent or a previous version of the object."
        errorText={errorText}
        stretch={true}
        i18nStrings={{ errorIconAriaLabel: 'Error' }}
      >
        <S3ResourceSelector {...s3ResourceSelectorProps} />
      </FormField>
    );
  }
}

class App extends Component {
  content() {
    return (
      <ContentLayout header={<Header variant="h1">Run simulation</Header>}>
        <form onSubmit={event => event.preventDefault()}>
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link">Cancel</Button>
                <Button variant="primary">Run</Button>
              </SpaceBetween>
            }
          >
            <Container header={<Header variant="h2">Simulations</Header>}>
              <S3ResourceSelectorContainer />
            </Container>
          </Form>
        </form>
      </ContentLayout>
    );
  }

  render() {
    return (
      <AppLayout
        contentType="form"
        content={this.content()}
        headerSelector="#header"
        breadcrumbs={<Breadcrumbs />}
        navigation={<Navigation activeHref="#/distributions" />}
        ariaLabels={appLayoutLabels}
        toolsHide={true}
        notifications={<Notifications />}
      />
    );
  }
}

const root = createRoot(document.getElementById('app'));
root.render(<App />);
