// Copyright (c) 2021 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

import { Router } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { createBrowserHistory } from 'history'
import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GraphQLError } from 'graphql'
import { wait } from '../../lib/test-helper'
import OverviewPage, { mapProviderFromLabel } from './OverviewPage'
import { GetOverviewDocument } from '../../console-sdk/console-sdk'
import { SearchResultCountDocument, SearchResultItemsDocument } from '../../search-sdk/search-sdk'

it('should responsed with correct value for mapProviderFromLabel function', () => {
    expect(mapProviderFromLabel('Amazon')).toEqual('aws')
    expect(mapProviderFromLabel('Azure')).toEqual('azr')
    expect(mapProviderFromLabel('Baremetal')).toEqual('bmc')
    expect(mapProviderFromLabel('Google')).toEqual('gcp')
    expect(mapProviderFromLabel('IBM')).toEqual('ibm')
    expect(mapProviderFromLabel('IBMPowerPlatform')).toEqual('ibmpower')
    expect(mapProviderFromLabel('IBMZPlatform')).toEqual('ibmz')
    expect(mapProviderFromLabel('RedHat')).toEqual('rhocm')
    expect(mapProviderFromLabel('VMware')).toEqual('vmw')
    expect(mapProviderFromLabel('other')).toEqual('other')
})

it('should render overview page in loading state', async () => {
    render(
        <RecoilRoot>
            <Router history={createBrowserHistory()}>
                <MockedProvider mocks={[]}>
                    <OverviewPage />
                </MockedProvider>
            </Router>
        </RecoilRoot>
    )
    // Test the loading state while apollo query finishes
    await waitFor(() => expect(screen.getByText('Loading')).toBeInTheDocument())
})

it('should render overview page in error state', async () => {
    const mocks = [
        {
            request: {
                query: GetOverviewDocument,
            },
            result: {
                errors: [new GraphQLError('Error getting overview data')],
            },
        },
    ]

    render(
        <RecoilRoot>
            <Router history={createBrowserHistory()}>
                <MockedProvider mocks={mocks}>
                    <OverviewPage />
                </MockedProvider>
            </Router>
        </RecoilRoot>
    )
    // Test the loading state while apollo query finishes
    expect(screen.getByText('Loading')).toBeInTheDocument()
    // This wait pauses till apollo query is returning data
    await wait()
    // Test that the component has rendered correctly with an error
    await waitFor(() => expect(screen.queryByText('overview.data.error.title')).toBeTruthy())
})

it('should render overview page with expected data', async () => {
    const mocks = [
        {
            request: {
                query: GetOverviewDocument,
            },
            result: {
                data: {
                    overview: {
                        clusters: [
                            {
                                metadata: {
                                    name: 'local-cluster',
                                    namespace: 'local-cluster',
                                    labels: {
                                        cloud: 'Amazon',
                                        clusterID: '0423d368-1f67-4300-bd26-05955bbbbf58',
                                        'installer.name': 'multiclusterhub',
                                        'installer.namespace': 'open-cluster-management',
                                        'local-cluster': 'true',
                                        name: 'local-cluster',
                                        vendor: 'OpenShift',
                                        region: 'Other',
                                        environment: 'Other',
                                    },
                                    uid: null,
                                    __typename: 'Metadata',
                                },
                                consoleURL: 'https://console-openshift-console.apps.mock-cluster-name.com',
                                status: 'ok',
                                __typename: 'ClusterOverview',
                            },
                            {
                                metadata: {
                                    name: 'managed-cluster',
                                    namespace: 'managed-cluster',
                                    labels: {
                                        cloud: 'Azure',
                                        clusterID: '1111-2222-3333-4444',
                                        'installer.name': 'multiclusterhub',
                                        'installer.namespace': 'open-cluster-management',
                                        'local-cluster': 'false',
                                        name: 'managed-cluster',
                                        vendor: 'OpenShift',
                                        region: 'Other',
                                        environment: 'Other',
                                    },
                                    uid: null,
                                    __typename: 'Metadata',
                                },
                                consoleURL: 'https://console-openshift-console.apps.mock-cluster-name.com',
                                status: 'ok',
                                __typename: 'ClusterOverview',
                            },
                        ],
                        applications: [
                            {
                                metadata: {
                                    name: 'nginx-app-3',
                                    namespace: null,
                                    __typename: 'Metadata',
                                },
                                raw: null,
                                selector: null,
                                __typename: 'ApplicationOverview',
                            },
                        ],
                        compliances: [
                            {
                                metadata: null,
                                raw: {
                                    status: {
                                        status: [
                                            {
                                                clustername: 'local-cluster',
                                                clusternamespace: 'local-cluster',
                                                compliant: 'Compliant',
                                            },
                                            {
                                                clustername: 'managed-cluster',
                                                clusternamespace: 'managed-cluster',
                                                compliant: 'NonCompliant',
                                            },
                                        ],
                                    },
                                },
                                __typename: 'ComplianceOverview',
                            },
                        ],
                        timestamp: 'Wed Jan 13 2021 13:19:40 GMT+0000 (Coordinated Universal Time)',
                        __typename: 'Overview',
                    },
                },
            },
        },
        {
            request: {
                query: SearchResultCountDocument,
                variables: {
                    input: [
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['node'],
                                },
                            ],
                        },
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['pod'],
                                },
                            ],
                        },
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['pod'],
                                },
                                {
                                    property: 'status',
                                    values: ['Running', 'Completed'],
                                },
                            ],
                        },
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['pod'],
                                },
                                {
                                    property: 'status',
                                    values: ['Pending', 'ContainerCreating', 'Waiting', 'Terminating'],
                                },
                            ],
                        },
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['pod'],
                                },
                                {
                                    property: 'status',
                                    values: [
                                        'Failed',
                                        'CrashLoopBackOff',
                                        'ImagePullBackOff',
                                        'Terminated',
                                        'OOMKilled',
                                        'Unknown',
                                    ],
                                },
                            ],
                        },
                    ],
                },
            },
            result: {
                data: {
                    searchResult: [
                        {
                            count: 6,
                            __typename: 'SearchResult',
                        },
                        {
                            count: 335,
                            __typename: 'SearchResult',
                        },
                        {
                            count: 335,
                            __typename: 'SearchResult',
                        },
                        {
                            count: 0,
                            __typename: 'SearchResult',
                        },
                        {
                            count: 0,
                            __typename: 'SearchResult',
                        },
                    ],
                },
            },
        },
        {
            request: {
                query: SearchResultItemsDocument,
                variables: {
                    input: [
                        {
                            keywords: [],
                            filters: [
                                {
                                    property: 'kind',
                                    values: ['policyreport'],
                                },
                                {
                                    property: 'scope',
                                    values: ['local-cluster', 'managed-cluster'],
                                },
                            ],
                        },
                    ],
                },
            },
            result: {
                data: {
                    searchResult: [
                        {
                            items: [
                                {
                                    kind: 'policyreport',
                                    name: 'local-cluster-policyreport',
                                    namespace: 'local-cluster',
                                    numRuleViolations: 1,
                                    scope: 'local-cluster',
                                    critical: 1,
                                    important: 0,
                                    moderate: 0,
                                    low: 0,
                                },
                                {
                                    kind: 'policyreport',
                                    name: 'managed-cluster-policyreport',
                                    namespace: 'managed-cluster',
                                    numRuleViolations: 2,
                                    scope: 'managed-cluster',
                                    critical: 1,
                                    important: 1,
                                    moderate: 0,
                                    low: 0,
                                },
                            ],
                            __typename: 'SearchResult',
                        },
                    ],
                },
            },
        },
    ]

    const { getAllByText, getByText, queryByText } = render(
        <RecoilRoot>
            <Router history={createBrowserHistory()}>
                <MockedProvider mocks={mocks}>
                    <OverviewPage />
                </MockedProvider>
            </Router>
        </RecoilRoot>
    )
    // Test the loading state while apollo query finishes
    expect(getByText('Loading')).toBeInTheDocument()
    // This wait pauses till apollo query is returning data
    await wait()
    // Test that the component has rendered correctly with an error
    expect(queryByText('Amazon')).toBeTruthy()

    // Check Cluster compliance chart rendered
    expect(getAllByText('Cluster compliance')).toHaveLength(2)
    expect(getByText('1 Compliant')).toBeTruthy()
    expect(getByText('1 Non-compliant')).toBeTruthy()

    // Check PolicyReport chart
    expect(getByText('2 Critical')).toBeTruthy()
    expect(getByText('1 Important')).toBeTruthy()
})
