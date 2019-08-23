export class ResolvedPv {
  public resolvedName: string;
  public constructor(resolvedName: string) {
    this.resolvedName = resolvedName;
  }
}

function interpolate(
  str: string,
  substitutions: { [substitution: string]: string }
): string {
  const requiredMappings: string[] = [];

  const regexp = /\${(.*?)}/g;
  let result = null;
  while ((result = regexp.exec(str))) {
    requiredMappings.push(result[1]);
  }
  const missingsMappings = requiredMappings.filter(
    (x: string): boolean => substitutions[x] === undefined
  );

  if (missingsMappings.length !== 0) {
    throw new NoMapping(missingsMappings[0]);
  }

  return str.replace(/\${(.*?)}/g, (x, g): string => substitutions[g]);
}

export class NoMapping extends Error {
  public mapping: string;
  public constructor(mapping: string) {
    super("No mapping for " + mapping);
    this.mapping = mapping;
    this.name = "UnexpectedInput";
  }
}

export class PvResolver {
  private substitutions: { [unmapped: string]: string };
  private resolutions: { [unmapped: string]: ResolvedPv };
  private reverseResolutions: { [resolved: string]: string[] };

  public constructor() {
    this.substitutions = {};
    this.resolutions = {};
    this.reverseResolutions = {};
  }

  public unresolve(resolved: ResolvedPv): string[] {
    let result = this.reverseResolutions[resolved.resolvedName];
    return result;
  }

  public resolve(
    unresolved: string
  ): {
    pv: ResolvedPv;
    newResolutions: ResolvedPv[];
    duplicateResolutions: ResolvedPv[];
  } {
    const oldResolution = this.resolutions[unresolved];
    const resolvedPv = new ResolvedPv(
      interpolate(unresolved, this.substitutions)
    );

    let duplicateResolutions: ResolvedPv[] = [];
    let newResolutions: ResolvedPv[] = [];
    if (oldResolution === undefined) {
      if (this.reverseResolutions[resolvedPv.resolvedName] === undefined) {
        newResolutions = [resolvedPv];
        duplicateResolutions = [];
      } else {
        newResolutions = [];
        duplicateResolutions = [resolvedPv];
      }
    } else if (oldResolution.resolvedName !== resolvedPv.resolvedName) {
      throw new Error("Resolution changed unexpectedly");
    } else {
      newResolutions = [];
    }

    this.mapResolution(unresolved, resolvedPv);

    return {
      pv: resolvedPv,
      newResolutions,
      duplicateResolutions
    };
  }

  private mapResolution(unresolved: string, newResolution: ResolvedPv): void {
    /** Maps a resolution and the corresponding reverse mapping */
    const oldResolution = this.resolutions[unresolved];

    if (oldResolution !== undefined) {
      this.reverseResolutions[oldResolution.resolvedName].splice(
        this.reverseResolutions[oldResolution.resolvedName].indexOf(unresolved)
      );

      if (this.reverseResolutions[oldResolution.resolvedName].length === 0) {
        delete this.reverseResolutions[oldResolution.resolvedName];
      }
    }
    this.resolutions[unresolved] = newResolution;

    if (this.reverseResolutions[newResolution.resolvedName] === undefined) {
      this.reverseResolutions[newResolution.resolvedName] = [];
    }

    if (
      this.reverseResolutions[newResolution.resolvedName].indexOf(
        unresolved
      ) === -1
    ) {
      this.reverseResolutions[newResolution.resolvedName].push(unresolved);
    }
  }

  public mapMacro(
    macro: string,
    valueString: string
  ): {
    newResolutions: ResolvedPv[];
    removedResolutions: ResolvedPv[];
    duplicateResolutions: ResolvedPv[];
  } {
    /**
       This may remove and add resolutions if the mappings have changed.
     */
    this.substitutions[macro] = valueString;

    let newResolutions: ResolvedPv[] = [];
    let removedResolutions: ResolvedPv[] = [];
    let duplicateResolutions: ResolvedPv[] = [];
    let updates: { [unresolved: string]: ResolvedPv } = {};

    // map everything affresh

    for (let unresolved in this.resolutions) {
      // potentially inefficient - we could pull out the mappings involved
      //   in each resolution and then only remap these. But this feels like
      //   a premature performance hack

      const newOrDuplicateResolutions: ResolvedPv[] = [];
      const oldResolution = this.resolutions[unresolved];
      const newResolution = new ResolvedPv(
        interpolate(unresolved, this.substitutions)
      );
      if (oldResolution.resolvedName !== newResolution.resolvedName) {
        updates[unresolved] = newResolution;
        newOrDuplicateResolutions.push(newResolution);
      }

      // for each update identifies an unresolved pv and a resolved pv
      // first collect up these affected pvs

      const maybeRemovedResolutions: ResolvedPv[] = [];
      for (const update of Object.keys(updates)) {
        maybeRemovedResolutions.push(this.resolutions[update]);
      }

      // The added or updated resolutions are added or updated accordingly to
      // whether there was a mapping to them prior to update

      for (const newOrDuplicateResolution of newOrDuplicateResolutions) {
        if (
          this.reverseResolutions[newOrDuplicateResolution.resolvedName] ===
          undefined
        ) {
          newResolutions.push(newOrDuplicateResolution);
        } else {
          duplicateResolutions.push(newOrDuplicateResolution);
        }
      }

      for (const update of Object.keys(updates)) {
        this.mapResolution(update, updates[update]);
      }

      // The maybeRemovedResolutions are removed if there is no reverse mapping
      // to them after update
      for (const maybeRemovedResolution of maybeRemovedResolutions) {
        if (
          this.reverseResolutions[maybeRemovedResolution.resolvedName] ===
          undefined
        ) {
          removedResolutions.push(maybeRemovedResolution);
        }
      }
    }

    return {
      newResolutions,
      removedResolutions,
      duplicateResolutions
    };
  }
}
