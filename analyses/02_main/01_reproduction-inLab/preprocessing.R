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

d_flowchart = df %>%
        select(chain,deadend,generation,reproduction,story_text,story_title)

# there is only one deadend because of multiple entries
d_flowchart[d_flowchart$deadend=="true" & !d_flowchart$generation==5,]

d_flowchart$story_text = gsub("(.{201,}?)\\s", "\\1\n", d_flowchart$story_text)
d_flowchart$reproduction = gsub("(.{61,}?)\\s", "\\1\n", d_flowchart$reproduction)
write.csv(d_flowchart, file = here("data","02_main","01_reproduction-inLab","flowchart_data.csv"), row.names = FALSE)

# currently we use all reproductions
d_followup = df %>%
  select(chain,generation,reproduction,story_title)

write.table(d_followup, file = here("experiments","02_main","02_subjective-ratings","trial_info","reproduction-data.csv"), sep=";", row.names = FALSE, qmethod = "double")

