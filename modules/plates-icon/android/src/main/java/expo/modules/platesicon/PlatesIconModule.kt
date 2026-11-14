package expo.modules.platesicon

import android.content.ComponentName
import android.content.Context
import android.content.pm.PackageManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Switches the home-screen icon by enabling one <activity-alias> (added by
 * plugins/withThemeIcons.js) and disabling the others. Call it while the app is
 * in the background: some launchers restart the app when the alias changes.
 */
class PlatesIconModule : Module() {
  private val context: Context?
    get() = appContext.reactContext

  private fun alias(ctx: Context, id: String) = ComponentName(ctx.packageName, "${ctx.packageName}.MainActivity_$id")

  override fun definition() = ModuleDefinition {
    Name("PlatesIcon")

    Function("getIcon") {
      val ctx = context ?: return@Function null
      val pm = ctx.packageManager
      ICONS.firstOrNull { id ->
        when (pm.getComponentEnabledSetting(alias(ctx, id))) {
          PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
          PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> id == DEFAULT_ICON
          else -> false
        }
      }
    }

    Function("setIcon") { id: String ->
      val ctx = context ?: return@Function false
      if (!ICONS.contains(id)) return@Function false
      val pm = ctx.packageManager
      try {
        // enable the new icon first so there is always one launcher entry
        pm.setComponentEnabledSetting(alias(ctx, id), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
        for (other in ICONS) {
          if (other != id) {
            pm.setComponentEnabledSetting(alias(ctx, other), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
          }
        }
        true
      } catch (e: Exception) {
        false
      }
    }
  }

  companion object {
    const val DEFAULT_ICON = "night"
    val ICONS = listOf("night", "chalk", "iron", "calm", "crimson", "sunny", "halftone", "lash", "blush", "forest", "mono", "ocean", "sunset", "matcha", "neon")
  }
}
