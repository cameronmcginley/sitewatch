# SiteWatch Documentation

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Check Functions](#check-functions)
  - [Keyword Check](#keyword-check)
  - [Page Difference](#page-difference)
  - [AI Check](#ai-check)
  - [eBay Price Threshold](#ebay-price-threshold)
  - [Keyword Density Check](#keyword-density-check)
- [Alerts and Notifications](#alerts-and-notifications)
- [Guide](#guide)
  - [Editing](#editing)
  - [Run Now](#run-now)
  - [Proxy](#proxy)

## Overview

SiteWatch is a tool for automated website monitoring and change detection. It supports various check functions and sends notifications when specified conditions are met.

## Core Features

- Automated URL monitoring at user-defined intervals (minimum 5 minutes)
- Multiple check functions for different monitoring scenarios
- Email notifications for triggered conditions
- Simple configuration process

## Check Functions

### Keyword Check

- **Function**: Detects presence or absence of specified keywords on a webpage.
- **Input**: Keyword

### Page Difference

- **Function**: Compares current webpage against previous version to detect changes.
- **Input**: Percentage threshold for change

### AI Check

- **Function**: Uses AI to evaluate custom conditions based on page content.
- **Input**: Custom query and alert condition

### eBay Price Threshold

- **Function**: Monitors "Buy it Now" prices on eBay listings.
- **Input**: Price threshold

### Keyword Density Check

- **Function**: Calculates keyword density on a webpage.
- **Input**: Keyword and density threshold

## Alerts and Notifications

Notifications are sent via email when a check function returns true. Each notification includes:

- Alias (configured when creating your check)
- Target URL
- Check function result summary
- Timestamp of check

## Guide

1. Head to the [application](/app)
2. Click `Create Check`
3. Fill in the form
   1. Input desired `URL`, `Check Type`, `email`, `interval`, etc
4. `Submit` and sit back!
   1. Can follow the table to see `when checks run`, `previous result`, and more
5. When your check hits your given condition, depending on the `check type` you chose, you will receive an email notification

The system will operate continuously based on your specified parameters.

### Editing

Press `Details` in rows for access to edit certain fields

### Run Now

In the `Details` tab, press the `Run Check Now` button to queue up the check to run.

`Now` is a bit misleading, it will actually run at the next 5 minute mark when the system spins up.

### Proxy

When creating a check you can opt to use a proxy for your check. In case your check fails, this will likely help bypass any blocks your URL is giving our system.