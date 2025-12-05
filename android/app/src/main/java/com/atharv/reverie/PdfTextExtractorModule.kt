package com.atharv.reverie

import com.facebook.react.bridge.*
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper
import java.io.File

class PdfTextExtractorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PdfTextExtractor"
    }

    @ReactMethod
    fun extractText(filePath: String, promise: Promise) {
        try {
            // Initialize PDFBox for Android
            PDFBoxResourceLoader.init(reactApplicationContext)

            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found at: $filePath")
                return
            }

            val document = PDDocument.load(file)
            val stripper = PDFTextStripper()
            
            // Preserve layout and paragraph structure
            stripper.setSortByPosition(true)
            stripper.setLineSeparator("\n")
            stripper.setWordSeparator(" ")
            stripper.setArticleStart("")
            stripper.setArticleEnd("")
            stripper.setParagraphStart("")
            stripper.setParagraphEnd("")
            stripper.setPageStart("")
            stripper.setPageEnd("")
            stripper.setAddMoreFormatting(true)
            stripper.setIndentThreshold(2.0f)
            stripper.setDropThreshold(2.5f)
            stripper.setAverageCharTolerance(0.3f)
            stripper.setSpacingTolerance(0.5f)
            
            val pageCount = document.numberOfPages
            val result = Arguments.createMap()
            result.putInt("pageCount", pageCount)
            
            val pages = Arguments.createArray()
            
            for (i in 1..pageCount) {
                stripper.startPage = i
                stripper.endPage = i
                
                var pageText = stripper.getText(document)
                
                // Post-process to improve paragraph detection
                // Replace multiple newlines with double newline for paragraphs
                pageText = pageText.replace(Regex("\\n\\s*\\n"), "\n\n")
                // Normalize whitespace within lines
                pageText = pageText.replace(Regex("[ \\t]+"), " ")
                // Remove trailing spaces from lines
                pageText = pageText.replace(Regex(" +\\n"), "\n")
                
                val pageData = Arguments.createMap()
                pageData.putInt("pageNumber", i)
                pageData.putString("text", pageText.trim())

                pages.pushMap(pageData)
            }

            result.putArray("pages", pages)
            document.close()

            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("EXTRACTION_ERROR", "Failed to extract text: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getPageCount(filePath: String, promise: Promise) {
        try {
            PDFBoxResourceLoader.init(reactApplicationContext)

            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found at: $filePath")
                return
            }

            val document = PDDocument.load(file)
            val pageCount = document.numberOfPages
            document.close()

            promise.resolve(pageCount)

        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get page count: ${e.message}", e)
        }
    }

    @ReactMethod
    fun extractPageText(filePath: String, pageNumber: Int, promise: Promise) {
        try {
            PDFBoxResourceLoader.init(reactApplicationContext)

            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "PDF file not found at: $filePath")
                return
            }

            val document = PDDocument.load(file)

            if (pageNumber < 1 || pageNumber > document.numberOfPages) {
                document.close()
                promise.reject("INVALID_PAGE", "Page number out of range")
                return
            }

            val stripper = PDFTextStripper()
            
            // Preserve layout and paragraph structure
            stripper.setSortByPosition(true)
            stripper.setLineSeparator("\n")
            stripper.setWordSeparator(" ")
            stripper.setArticleStart("")
            stripper.setArticleEnd("")
            stripper.setParagraphStart("")
            stripper.setParagraphEnd("")
            stripper.setPageStart("")
            stripper.setPageEnd("")
            stripper.setAddMoreFormatting(true)
            stripper.setIndentThreshold(2.0f)
            stripper.setDropThreshold(2.5f)
            stripper.setAverageCharTolerance(0.3f)
            stripper.setSpacingTolerance(0.5f)
            stripper.startPage = pageNumber
            stripper.endPage = pageNumber
            
            var pageText = stripper.getText(document)
            document.close()
            
            // Post-process to improve paragraph detection
            pageText = pageText.replace(Regex("\\n\\s*\\n"), "\n\n")
            pageText = pageText.replace(Regex("[ \\t]+"), " ")
            pageText = pageText.replace(Regex(" +\\n"), "\n")
            
            promise.resolve(pageText.trim())        } catch (e: Exception) {
            promise.reject("EXTRACTION_ERROR", "Failed to extract page text: ${e.message}", e)
        }
    }
}
