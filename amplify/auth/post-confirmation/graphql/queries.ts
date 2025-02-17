/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getContract = /* GraphQL */ `query GetContract($id: ID!) {
  getContract(id: $id) {
    contractor
    createdAt
    id
    job {
      amountOffered
      createdAt
      description
      id
      requiredMaterials
      submitter
      title
      updatedAt
      __typename
    }
    jobID
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetContractQueryVariables,
  APITypes.GetContractQuery
>;
export const getJob = /* GraphQL */ `query GetJob($id: ID!) {
  getJob(id: $id) {
    amountOffered
    contract {
      contractor
      createdAt
      id
      jobID
      updatedAt
      __typename
    }
    createdAt
    description
    id
    requiredMaterials
    submitter
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetJobQueryVariables, APITypes.GetJobQuery>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    ccNum
    createdAt
    email
    id
    profileOwner
    shippingAddress
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const listContracts = /* GraphQL */ `query ListContracts(
  $filter: ModelContractFilterInput
  $limit: Int
  $nextToken: String
) {
  listContracts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      contractor
      createdAt
      id
      jobID
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListContractsQueryVariables,
  APITypes.ListContractsQuery
>;
export const listJobs = /* GraphQL */ `query ListJobs($filter: ModelJobFilterInput, $limit: Int, $nextToken: String) {
  listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      amountOffered
      createdAt
      description
      id
      requiredMaterials
      submitter
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListJobsQueryVariables, APITypes.ListJobsQuery>;
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      ccNum
      createdAt
      email
      id
      profileOwner
      shippingAddress
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;
