import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class LeadTimeValidator implements ValidatorConstraintInterface {
  validate(startsAt: Date) {
    const leadTimeMs = 15 * 60 * 1000;
    const nowPlusLeadTime = new Date(Date.now() + leadTimeMs);

    return startsAt >= nowPlusLeadTime;
  }

  defaultMessage() {
    return 'startsAt must be at least 15 minutes from now';
  }
}
