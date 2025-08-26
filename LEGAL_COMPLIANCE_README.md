# Legal Compliance System for Symbol Duel

## Overview

Symbol Duel is a skill-based puzzle competition game that can legally offer real-money prizes in most US states. This document explains the legal framework and compliance measures implemented to ensure the game operates within legal boundaries.

## Legal Framework

### Why Skill-Based Games Are Legal

Symbol Duel qualifies as a skill-based competition rather than gambling because it meets the legal criteria:

1. **Prize awarded** ✅ - Real-money prizes for winners
2. **Paid entry fee** ✅ - Tournament entry fees
3. **Outcome based on chance** ❌ - **NO random elements**

Since the third element (chance) is absent, Symbol Duel is technically not classified as gambling under US federal law.

### Legal Precedents

The game follows the same legal framework used by companies like Skillz, which successfully operate skill-based real-money competitions:

- **Predominance Test**: Courts determine if skill or chance predominates
- **Material Element Test**: Whether chance plays a material role in the outcome
- **Skill-Based Classification**: Puzzle-solving ability determines success

## State-by-State Compliance

### Legal States (Real-Money Prizes Available)

Most US states allow real-money skill-based competitions:
- AL, AK, AZ, CA, CO, FL, GA, HI, ID, IL, IN, IA, KS, KY
- ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY
- NC, ND, OH, OK, OR, PA, RI, SC, TN, TX, UT, VT, VA, WA
- WV, WI, WY

### Restricted States (Virtual Play Only)

Real-money prizes are not available in:
- **AR** (Arkansas)
- **CT** (Connecticut) 
- **DE** (Delaware)
- **LA** (Louisiana)
- **SD** (South Dakota)

### Additional Restrictions

Some states have specific restrictions for certain game types:
- **ME, IN, NJ**: Card and domino games restricted (not applicable to Symbol Duel)

## Compliance Features

### 1. Geolocation Verification

The system automatically detects user location using:
- **GPS coordinates** (primary method)
- **IP address fallback** (secondary method)
- **State verification** via reverse geocoding

### 2. Age Verification

- **Minimum age**: 18 years old
- **Birth date verification** required
- **Profile updates** track verification status

### 3. Skill-Based Game Validation

The system verifies that games contain no random elements:
- **Time-based scoring** (skill-based)
- **Speed metrics** (skill-based)
- **Accuracy tracking** (skill-based)
- **No random puzzle selection**
- **No random timing variations**

### 4. Compliance Logging

All compliance events are logged for audit purposes:
- Location permission requests
- Age verification attempts
- Compliance check results
- Tournament participation records

## Implementation Details

### Database Schema

```sql
-- Compliance-related fields in profiles table
ALTER TABLE profiles ADD COLUMN:
- birth_date DATE
- location_state VARCHAR(2)
- compliance_verified BOOLEAN
- compliance_verified_at TIMESTAMP
- last_compliance_check TIMESTAMP
- compliance_status VARCHAR(50)

-- Compliance logging tables
- compliance_logs
- compliance_verifications  
- tournament_compliance
```

### Components

1. **ComplianceVerification.jsx**: Multi-step verification process
2. **TournamentComplianceWrapper.jsx**: Wraps tournament access
3. **legalCompliance.js**: Core compliance logic and utilities

### API Integration

- **OpenCage Geocoding**: State detection from coordinates
- **IP Geolocation**: Fallback location detection
- **Supabase**: User profile and compliance storage

## User Experience

### For Compliant Users

1. **Location permission** granted
2. **Age verification** completed
3. **Full access** to real-money tournaments
4. **Legal disclaimer** displayed

### For Restricted Users

1. **Clear explanation** of restrictions
2. **Virtual play mode** available
3. **Practice opportunities** with virtual tokens
4. **Re-verification** option available

### For Unverified Users

1. **Step-by-step verification** process
2. **Clear requirements** explained
3. **Progress tracking** throughout
4. **Error handling** and retry options

## Marketing Compliance

### Approved Language

✅ **Use these terms:**
- "Skill-based competition"
- "Real-world prizes"
- "Puzzle-solving skills"
- "Competitive tournaments"

❌ **Avoid these terms:**
- "Gambling" or "casino"
- "Real money" (in restricted contexts)
- "Wager" or "bet"
- "Addictive" or "luck-based"

### App Store Compliance

- **Clear descriptions** of skill-based nature
- **State restrictions** clearly stated
- **Age requirements** prominently displayed
- **Virtual play options** for restricted areas

## Legal Considerations

### Ongoing Compliance

1. **Regular audits** of compliance systems
2. **State law monitoring** for changes
3. **User verification** updates as needed
4. **Legal counsel** review of operations

### Risk Mitigation

1. **Geographic restrictions** strictly enforced
2. **Age verification** mandatory
3. **Compliance logging** comprehensive
4. **User education** about restrictions

### Regulatory Changes

The system is designed to adapt to:
- New state restrictions
- Updated age requirements
- Modified compliance standards
- Regulatory guidance changes

## Technical Requirements

### Browser Support

- **Geolocation API** support required
- **Modern browsers** recommended
- **Mobile devices** fully supported
- **GPS accuracy** preferred over IP

### API Keys Required

- **OpenCage Geocoding**: For state detection
- **IP Geolocation**: Fallback service
- **Supabase**: Database and authentication

### Performance Considerations

- **Caching** of compliance results
- **Background verification** where possible
- **Graceful degradation** for API failures
- **User experience** optimization

## Testing and Validation

### Compliance Testing

1. **Location simulation** for different states
2. **Age verification** edge cases
3. **API failure** scenarios
4. **User flow** validation

### Legal Review

1. **State-by-state** compliance verification
2. **Age requirement** validation
3. **Marketing language** review
4. **User agreement** legal review

## Conclusion

Symbol Duel's legal compliance system ensures the game operates within legal boundaries while providing a fair, skill-based competitive environment. The comprehensive verification process protects both users and the platform while enabling legal real-money competitions in compliant jurisdictions.

For questions about legal compliance, consult with legal counsel familiar with skill-based gaming regulations in your target markets.
