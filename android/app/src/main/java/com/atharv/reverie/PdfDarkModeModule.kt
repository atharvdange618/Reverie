package com.atharv.reverie

import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.UiThreadUtil

class PdfDarkModeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PdfDarkMode"
    }

    @ReactMethod
    fun enableDarkMode(viewTag: Int, enable: Boolean, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                android.util.Log.d("PdfDarkMode", "enableDarkMode called: viewTag=$viewTag, enable=$enable")
                
                val activity = reactApplicationContext.currentActivity
                if (activity == null) {
                    android.util.Log.e("PdfDarkMode", "Activity is null")
                    promise.reject("ERROR", "Activity not available")
                    return@runOnUiThread
                }
                
                val rootView = activity.window.decorView.rootView
                val view = findViewByTag(rootView, viewTag)
                
                if (view == null) {
                    android.util.Log.e("PdfDarkMode", "Could not find view with tag: $viewTag")
                    promise.reject("VIEW_NOT_FOUND", "Could not find view with tag: $viewTag")
                    return@runOnUiThread
                }
                
                android.util.Log.d("PdfDarkMode", "View found: ${view.javaClass.simpleName}")
                
                if (enable) {
                    applyColorInversion(view)
                    android.util.Log.d("PdfDarkMode", "Color inversion applied")
                } else {
                    removeColorInversion(view)
                    android.util.Log.d("PdfDarkMode", "Color inversion removed")
                }
                
                promise.resolve(true)
            } catch (e: Exception) {
                android.util.Log.e("PdfDarkMode", "Error in enableDarkMode", e)
                promise.reject("ERROR", "Failed to apply dark mode: ${e.message}", e)
            }
        }
    }
    
    private fun findViewByTag(root: View, targetTag: Int): View? {
        if (root.id == targetTag) {
            return root
        }
        
        if (root is ViewGroup) {
            for (i in 0 until root.childCount) {
                val child = root.getChildAt(i)
                val found = findViewByTag(child, targetTag)
                if (found != null) {
                    return found
                }
            }
        }
        
        return null
    }

    private fun applyColorInversion(view: View) {
        android.util.Log.d("PdfDarkMode", "applyColorInversion to ${view.javaClass.simpleName}")
        
        // Color matrix for inversion
        val colorMatrix = ColorMatrix()
        
        // Invert colors: multiply by -1 and add 255
        colorMatrix.set(floatArrayOf(
            -1f, 0f, 0f, 0f, 255f,
            0f, -1f, 0f, 0f, 255f,
            0f, 0f, -1f, 0f, 255f,
            0f, 0f, 0f, 1f, 0f
        ))
        
        val paint = Paint()
        paint.colorFilter = ColorMatrixColorFilter(colorMatrix)
        
        // Apply to the view's layer
        view.setLayerType(View.LAYER_TYPE_HARDWARE, paint)
        android.util.Log.d("PdfDarkMode", "Layer type set on main view")
        
        if (view is ViewGroup) {
            android.util.Log.d("PdfDarkMode", "Applying to ${view.childCount} children")
            applyToAllChildren(view, paint)
        }
    }

    private fun removeColorInversion(view: View) {
        view.setLayerType(View.LAYER_TYPE_NONE, null)
        
        if (view is ViewGroup) {
            removeFromAllChildren(view)
        }
    }

    private fun applyToAllChildren(viewGroup: ViewGroup, paint: Paint) {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)
            child.setLayerType(View.LAYER_TYPE_HARDWARE, paint)
            android.util.Log.d("PdfDarkMode", "Applied to child $i: ${child.javaClass.simpleName}")
            
            if (child is ViewGroup) {
                applyToAllChildren(child, paint)
            }
        }
    }

    private fun removeFromAllChildren(viewGroup: ViewGroup) {
        for (i in 0 until viewGroup.childCount) {
            val child = viewGroup.getChildAt(i)
            child.setLayerType(View.LAYER_TYPE_NONE, null)
            
            if (child is ViewGroup) {
                removeFromAllChildren(child)
            }
        }
    }
}
