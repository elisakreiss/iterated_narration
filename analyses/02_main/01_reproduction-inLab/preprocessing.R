library(tidyverse)
library(here)

# set_here("/Users/elisakreiss/Documents/business/projects/iterated_narration")

# df = read_csv(here("data","02_main","01_reproduction-inLab","raw_confidential.csv"))
# 
# anonymous_df = arrange(df,submission_id) %>% 
#   mutate(id=sort(rep(seq.int(1,length(unique(submission_id))),5))) %>% 
#   select(-comments, -submission_id)
# 
# write.csv(anonymous_df, file = here("data","02_main","01_reproduction-inLab","raw.csv"), row.names = FALSE)

df = read_csv(here("data","02_main","01_reproduction-inLab","raw.csv"))

clean = df %>%
        select(chain,deadend,generation,reproduction,story_text,story_title)

clean$story_text = gsub("(.{201,}?)\\s", "\\1\n", clean$story_text)
clean$reproduction = gsub("(.{61,}?)\\s", "\\1\n", clean$reproduction)
write.csv(clean, file = here("data","02_main","01_reproduction-inLab","flowchart_data.csv"), row.names = FALSE)
