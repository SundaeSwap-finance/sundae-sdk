import { Composer } from "../abstracts/Composer.abstract.class";
import { BuilderLucidV3 } from "../builders/lucid/Builder.Lucid.V3.class";

export type TComposerLucidBuilders = BuilderLucidV3;

export class ComposerLucid extends Composer {
  constructor(
    public finalDestinationAddress: string,
    public builders: TComposerLucidBuilders[],
  ) {
    super();
    this.builders.forEach((b) => {
      this.tasks.concat(b.getTasks());
    });
  }

  async complete(): Promise<ComposerLucid> {
    return this;
  }

  async sign(): Promise<ComposerLucid> {
    return this;
  }

  async submit(): Promise<string> {
    return "";
  }
}
