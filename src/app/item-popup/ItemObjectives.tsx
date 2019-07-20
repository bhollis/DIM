import React from 'react';
import classNames from 'classnames';
import { DimObjective } from '../inventory/item-types';
import { AppIcon } from '../shell/icons';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import './ItemObjectives.scss';
import ObjectiveDescription from '../progress/ObjectiveDescription';
import { percent } from '../shell/filters';
import { D2ManifestDefinitions } from '../destiny2/d2-definitions.service';
import { SupplementalObjectives } from 'app/progress/SupplementalObjectives';
import Objective from 'app/progress/Objective';
import { D2SupplementalManifestDefinitions } from 'app/progress/D2SupplementalManifestDefinitions';
import objectiveHashToRecordHash from 'data/d2/objective-triumph.json';
import Record from 'app/collections/Record';

export default function ItemObjectives({
  itemHash,
  objectives,
  defs
}: {
  itemHash: number;
  objectives: DimObjective[] | null;
  defs?: D2ManifestDefinitions;
}) {
  const supplementalObjectives = SupplementalObjectives.get(itemHash);

  if (!defs || ((!objectives || !objectives.length) && !supplementalObjectives.length)) {
    return null;
  }

  return (
    <div className="item-objectives item-details">
      {objectives &&
        objectives.map((objective) => (
          <ItemObjective key={objective.displayName} objective={objective} defs={defs} />
        ))}
      {supplementalObjectives.map((objective) => (
        <Objective
          defs={D2SupplementalManifestDefinitions}
          objective={objective}
          key={objective.objectiveHash}
        />
      ))}
    </div>
  );
}

// TODO: get rid of this in favor of the "raw" Objective component?
function ItemObjective({
  objective,
  defs
}: {
  objective: DimObjective;
  defs: D2ManifestDefinitions;
}) {
  console.log(objective.hash, objectiveHashToRecordHash[objective.hash]);
  if (objectiveHashToRecordHash[objective.hash] && !objective.complete) {
    return (
      <div
        title={objective.description}
        className={classNames('objective-row', {
          'objective-complete': objective.complete,
          'objective-boolean': objective.boolean
        })}
      >
        TRIUMPH!
      </div>
    );
  }

  return (
    <div
      title={objective.description}
      className={classNames('objective-row', {
        'objective-complete': objective.complete,
        'objective-boolean': objective.boolean
      })}
    >
      {objective.displayStyle === 'trials' ? (
        <div>
          {_.times(objective.completionValue, ($index) => (
            <AppIcon
              icon={faCircle}
              className={classNames('trials', {
                incomplete: $index >= objective.progress,
                wins: objective.completionValue === 9
              })}
            />
          ))}
          {objective.completionValue === 9 && objective.progress > 9 && (
            <span>+ {objective.progress - 9}</span>
          )}
        </div>
      ) : objective.displayStyle === 'integer' ? (
        <div className="objective-integer">
          <ObjectiveDescription displayName={objective.displayName} defs={defs} />
          <div className="objective-text">{objective.display}</div>
        </div>
      ) : (
        <>
          <div className="objective-checkbox" />
          <div className="objective-progress">
            <div
              className="objective-progress-bar"
              style={{ width: percent(objective.progress / objective.completionValue) }}
            />
            <ObjectiveDescription displayName={objective.displayName} defs={defs} />
            <div className="objective-text">{objective.display}</div>
          </div>
        </>
      )}
    </div>
  );
}
