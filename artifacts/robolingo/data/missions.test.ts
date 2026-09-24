import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getCurriculumMissionState, getCurriculumMissions, getSkillProgress } from './missions';

describe('curriculum mission filters', () => {
  it('filters missions by region without changing the curriculum order', () => {
    assert.deepEqual(
      getCurriculumMissions({ region: 'forest' }).map((mission) => mission.id),
      ['g7-people', 'g7-stories', 'g7-clues'],
    );
    assert.deepEqual(
      getCurriculumMissions({ region: 'castle' }).map((mission) => mission.id),
      ['g9-media', 'g9-future'],
    );
  });

  it('filters missions by curriculum track and supports combining filters', () => {
    assert.deepEqual(
      getCurriculumMissions({ curriculumYear: '8' }).map((mission) => mission.id),
      ['g8-world', 'g8-conversations', 'g8-real', 'g8-past'],
    );
    assert.deepEqual(
      getCurriculumMissions({ curriculumYear: '9', region: 'airport' }).map((mission) => mission.id),
      ['g9-global', 'g9-dialogue'],
    );
  });
});

describe('curriculum mission state', () => {
  const missions = getCurriculumMissions();

  it('marks completed, current, and blocked missions from the global sequence', () => {
    assert.equal(getCurriculumMissionState(missions[0], 1, 5), 'completed');
    assert.equal(getCurriculumMissionState(missions[1], 1, 5), 'current');
    assert.equal(getCurriculumMissionState(missions[2], 1, 5), 'blocked');
  });

  it('keeps an advanced current mission blocked until the English level is reached', () => {
    const adventurerMission = missions.find((mission) => mission.id === 'g7-people');
    const heroMission = missions.find((mission) => mission.id === 'g8-world');
    assert.ok(adventurerMission);
    assert.ok(heroMission);

    assert.equal(getCurriculumMissionState(adventurerMission!, 3, 4), 'blocked');
    assert.equal(getCurriculumMissionState(adventurerMission!, 3, 5), 'current');
    assert.equal(getCurriculumMissionState(heroMission!, 6, 9), 'blocked');
    assert.equal(getCurriculumMissionState(heroMission!, 6, 10), 'current');
  });

  it('clamps invalid mission counts instead of unlocking or completing out of bounds', () => {
    assert.equal(getCurriculumMissionState(missions[0], -1, 1), 'current');
    assert.equal(getCurriculumMissionState(missions[missions.length - 1], missions.length + 5, 30), 'completed');
  });
});

describe('skill evolution', () => {
  it('calculates all five skill percentages for the full curriculum', () => {
    assert.deepEqual(getSkillProgress(7), {
      grammar: 56,
      vocabulary: 67,
      reading: 50,
      listening: 14,
      speaking: 38,
    });
  });

  it('calculates skill percentages against the selected curriculum track', () => {
    assert.deepEqual(getSkillProgress(7, '6'), {
      grammar: 100,
      vocabulary: 100,
      reading: 0,
      listening: 0,
      speaking: 100,
    });
    assert.deepEqual(getSkillProgress(7, '8'), {
      grammar: 0,
      vocabulary: 100,
      reading: 50,
      listening: 0,
      speaking: 0,
    });
    assert.deepEqual(getSkillProgress(7, '9'), {
      grammar: 0,
      vocabulary: 0,
      reading: 0,
      listening: 0,
      speaking: 0,
    });
  });

  it('clamps mission counts for skill calculations', () => {
    assert.deepEqual(getSkillProgress(-3, '7'), {
      grammar: 0,
      vocabulary: 0,
      reading: 0,
      listening: 0,
      speaking: 0,
    });
    assert.deepEqual(getSkillProgress(999, '7'), {
      grammar: 100,
      vocabulary: 100,
      reading: 100,
      listening: 100,
      speaking: 100,
    });
  });
});