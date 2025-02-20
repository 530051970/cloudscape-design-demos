// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';
import {
  Container,
  Checkbox,
  ExpandableSection,
  Header,
  Input,
  RadioGroup,
  FormField,
  SpaceBetween,
  Select,
  Textarea,
  TimeInput,
  DatePicker,
} from '@cloudscape-design/components';
import { InfoLink } from '../../commons/common-components';
import useContentOrigins from '../../commons/use-content-origins';
import { SSL_CERTIFICATE_OPTIONS, SUPPORTED_HTTP_VERSIONS_OPTIONS } from '../form-config';

function DistributionsFooter({ state, onChange }) {
  return (
    <ExpandableSection header="Additional settings" variant="footer">
      <SpaceBetween size="l">
        <FormField
          label="Supported HTTP versions"
          description="Choose the version of the HTTP protocol that you want CloudFront to accept for viewer requests."
          stretch={true}
        >
          <RadioGroup
            items={SUPPORTED_HTTP_VERSIONS_OPTIONS}
            ariaRequired={true}
            value={state.httpVersion}
            onChange={({ detail: { value } }) => onChange('httpVersion', value)}
          />
        </FormField>
        <FormField label="IPv6">
          <Checkbox checked={state.ipv6isOn} onChange={({ detail: { checked } }) => onChange('ipv6isOn', checked)}>
            Turn on
          </Checkbox>
        </FormField>
      </SpaceBetween>
    </ExpandableSection>
  );
}

const defaultState = {
  sslCertificate: 'default',
  cloudFrontRootObject: '',
  alternativeDomainNames: '',
  s3BucketSelectedOption: null,
  certificateExpiryDate: '',
  certificateExpiryTime: '',
  httpVersion: 'http2',
  ipv6isOn: false,
};

const noop = () => {
  /*noop*/
};

export default function DistributionPanel({ updateTools, updateDirty = noop, readOnlyWithErrors = false }) {
  const [contentOriginsState, contentOriginsHandlers] = useContentOrigins();
  const [distributionPanelData, setDistributionPanelData] = useState(defaultState);

  useEffect(() => {
    const isDirty = JSON.stringify(distributionPanelData) !== JSON.stringify(defaultState);
    updateDirty(isDirty);
  }, [distributionPanelData]);

  const onChange = (attribute, value) => {
    if (readOnlyWithErrors) {
      return;
    }

    const newState = { ...distributionPanelData };
    newState[attribute] = value;
    setDistributionPanelData(newState);
  };

  const getErrorText = errorMessage => {
    return readOnlyWithErrors ? errorMessage : undefined;
  };

  return (
    <Container
      id="distribution-panel"
      header={<Header variant="h2">Distribution settings</Header>}
      footer={<DistributionsFooter state={distributionPanelData} onChange={onChange} />}
    >
      <SpaceBetween size="l">
        <FormField
          label="SSL/TLS certificate"
          info={
            <InfoLink
              id="certificate-method-info-link"
              onFollow={() => updateTools(2)}
              ariaLabel={'Information about SSL/TLS certificate.'}
            />
          }
          stretch={true}
        >
          <RadioGroup
            items={SSL_CERTIFICATE_OPTIONS}
            value={distributionPanelData.sslCertificate}
            ariaRequired={true}
            onChange={({ detail: { value } }) => onChange('sslCertificate', value)}
          />
        </FormField>
        <FormField
          label="Root object"
          info={
            <InfoLink
              id="root-object-info-link"
              onFollow={() => updateTools(3)}
              ariaLabel={'Information about root object.'}
            />
          }
          description="Enter the name of the object that you want CloudFront to return when a viewer request points to your root URL."
          errorText={getErrorText('You must specify a root object.')}
          i18nStrings={{ errorIconAriaLabel: 'Error' }}
        >
          <Input
            value={distributionPanelData.cloudFrontRootObject}
            ariaRequired={true}
            placeholder="index.html"
            onChange={({ detail: { value } }) => onChange('cloudFrontRootObject', value)}
          />
        </FormField>
        <FormField
          label={
            <>
              Alternative domain names (CNAMEs)<i> - optional</i>
            </>
          }
          info={
            <InfoLink
              id="cnames-info-link"
              onFollow={() => updateTools(4)}
              ariaLabel={'Information about alternative domain names.'}
            />
          }
          description="List any custom domain names that you use in addition to the CloudFront domain name for the URLs for your files."
          constraintText="Specify up to 100 CNAMEs separated with commas, or put each on a new line."
          stretch={true}
          errorText={getErrorText('You must specify at least one alternative domain name.')}
          i18nStrings={{ errorIconAriaLabel: 'Error' }}
        >
          <Textarea
            placeholder={'www.one.example.com\nwww.two.example.com'}
            value={distributionPanelData.alternativeDomainNames}
            onChange={({ detail: { value } }) => onChange('alternativeDomainNames', value)}
          />
        </FormField>
        <FormField
          label="S3 bucket for logs"
          description="The Amazon S3 bucket that you want CloudFront to store your access logs in."
          errorText={getErrorText('You must specify a S3 bucket.')}
          i18nStrings={{ errorIconAriaLabel: 'Error' }}
        >
          <Select
            {...contentOriginsHandlers}
            options={contentOriginsState.options}
            selectedAriaLabel="Selected"
            statusType={contentOriginsState.status}
            placeholder="Choose an S3 bucket"
            loadingText="Loading buckets"
            errorText="Error fetching buckets."
            recoveryText="Retry"
            finishedText={
              contentOriginsState.filteringText
                ? `End of "${contentOriginsState.filteringText}" results`
                : 'End of all results'
            }
            empty={contentOriginsState.filteringText ? "We can't find a match" : 'No origins'}
            filteringType="manual"
            filteringAriaLabel="Filter buckets"
            ariaRequired={true}
            selectedOption={distributionPanelData.s3BucketSelectedOption}
            onChange={({ detail: { selectedOption } }) => onChange('s3BucketSelectedOption', selectedOption)}
          />
        </FormField>

        <FormField stretch={true} label={<span id="certificate-expiry-label">Certificate expiry</span>}>
          <SpaceBetween size="s" direction="horizontal">
            <FormField
              stretch={true}
              description="Specify the date when the certificate should expire."
              className="date-time-container"
              errorText={getErrorText('Invalid date format.')}
              constraintText={'Use YYYY/MM/DD format.'}
              i18nStrings={{ errorIconAriaLabel: 'Error' }}
            >
              <DatePicker
                ariaLabelledby="certificate-expiry-label"
                placeholder="YYYY/MM/DD"
                previousMonthAriaLabel="Previous month"
                nextMonthAriaLabel="Next month"
                todayAriaLabel="Today"
                value={distributionPanelData.certificateExpiryDate}
                onChange={({ detail: { value } }) => onChange('certificateExpiryDate', value)}
                openCalendarAriaLabel={selectedDate =>
                  'Choose Date' + (selectedDate ? `, selected date is ${selectedDate}` : '')
                }
              />
            </FormField>
            <FormField
              stretch={true}
              description="Specify the time when the certificate should expire"
              constraintText="Use 24-hour format."
              className="date-time-container"
              errorText={getErrorText('Invalid time format.')}
              i18nStrings={{ errorIconAriaLabel: 'Error' }}
            >
              <TimeInput
                ariaLabelledby="certificate-expiry-label"
                use24Hour={true}
                placeholder="hh:mm:ss"
                value={distributionPanelData.certificateExpiryTime}
                onChange={({ detail: { value } }) => onChange('certificateExpiryTime', value)}
              />
            </FormField>
          </SpaceBetween>
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
