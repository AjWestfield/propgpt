import { getTeamNameOnly } from '../teamUtils';

describe('getTeamNameOnly', () => {
  it('should extract team name from two-word city names', () => {
    expect(getTeamNameOnly('Golden State Warriors')).toBe('Warriors');
    expect(getTeamNameOnly('Los Angeles Lakers')).toBe('Lakers');
    expect(getTeamNameOnly('New York Knicks')).toBe('Knicks');
  });

  it('should extract team name from single-word city names', () => {
    expect(getTeamNameOnly('Orlando Magic')).toBe('Magic');
    expect(getTeamNameOnly('Miami Heat')).toBe('Heat');
    expect(getTeamNameOnly('Boston Celtics')).toBe('Celtics');
  });

  it('should handle multi-word team names', () => {
    expect(getTeamNameOnly('Portland Trail Blazers')).toBe('Trail Blazers');
    expect(getTeamNameOnly('Minnesota Timberwolves')).toBe('Timberwolves');
    expect(getTeamNameOnly('Los Angeles Clippers')).toBe('Clippers');
  });

  it('should handle single-word team names', () => {
    expect(getTeamNameOnly('Heat')).toBe('Heat');
  });

  it('should handle empty string', () => {
    expect(getTeamNameOnly('')).toBe('');
  });
});
