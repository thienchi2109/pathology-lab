# Lab Sample Management System - Project Overview

## Purpose
An internal web application for managing laboratory samples with a **kit-first inventory approach**. The system tracks laboratory test kits from purchase through usage, links them to samples, records test results with image documentation, and provides analytical reporting capabilities.

## Key Features
- **Kit Inventory Management**: Track kits by batch with status monitoring (in_stock, assigned, used, void, expired, lost)
- **Sample Management**: Create samples by linking to kits, record 20-30 metadata fields per sample
- **Test Results**: Record 10-15 test metrics per sample with numeric/text values
- **Image Documentation**: Upload up to 10 images per sample (max 5MB each) as evidence
- **Unified Grid View**: Single interface combining kit inventory and sample data
- **Analytics & Reporting**: Pivot tables, charts, and dashboard for data analysis
- **Mobile-Optimized**: Responsive design for lab technicians working on mobile devices

## Target Users
- 5-7 concurrent users in a laboratory environment
- Primarily Vietnamese-speaking
- Two roles: **Editor** (lab technicians) and **Viewer** (read-only access)

## Key Business Rules
- Kits are managed as inventory; samples are created by linking to kits
- When a sample is linked to a kit, the kit status automatically updates to 'used'
- Maximum 100 kits can be created in a single batch
- Maximum 10 images per sample
- Sample codes follow format: T<month>_<#####> based on received date
- Overall result (KQ_CHUNG) is automatically calculated: 'NHIỄM' if any metric > 0, otherwise 'SẠCH'

## Current Status
- ✅ Project setup and configuration (Task 1)
- ✅ Database schema and migrations (Task 2)
- ✅ Authentication setup (Task 3)
- 🚧 Design system and layout components (Task 4 - Next)
