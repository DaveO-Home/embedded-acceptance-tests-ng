
import { Context } from "fuse-box/core/Context";
import { parsePluginOptions } from "fuse-box/plugins/pluginUtils";

export type IPluginStripProps = { [key: string]: any };
export function pluginStripCode(a?: IPluginStripProps | string | RegExp, b?: IPluginStripProps) {
  const [opts, matcher] = parsePluginOptions<IPluginStripProps>(a, b, {});
  return (ctx: Context) => {
    ctx.ict.on("assemble_fast_analysis", props => {
      if ((matcher && !matcher.test(props.module.props.absPath)) || 
        /node_modules/.test(props.module.props.absPath)) {
        return;
      }

      const { module } = props;
      ctx.log.info("pluginStripCode", "stripping code in $file \n", {
        file: module.props.fuseBoxPath,
      });

      const startComment =  opts.start || "develblock:start"; 
      const endComment =  opts.end || "develblock:end";
      const regexPattern = new RegExp("[\\t ]*(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
            + startComment + " ?[\\*\\/]?[\\s\\S]*?(\\/\\* ?|\\/\\/[\\s]*\\![\\s]*)"
            + endComment + " ?(\\*\\/)?[\\t ]*\\n?", "g");

      module.read();
      module.contents = module.contents.replace(regexPattern, "");
      return props;
    });
  };
}
